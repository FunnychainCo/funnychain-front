import axios from 'axios'
import * as firebase from "firebase";
import EventEmitter from "eventemitter3";
import {PROVIDER_FIREBASE_MAIL, USER_ENTRY_NO_VALUE, UserEntry} from "../generic/UserEntry";
import {DATABASE_USERS, UserDBEntry} from "../database/shared/DBDefinition";
import {audit} from "../log/Audit";
import {GLOBAL_PROPERTIES} from "../../properties/properties";
import {ipfsFileUploadService} from "../uploader/IPFSFileUploadService";
import {RemoteValue} from "../concurency/RemoteValue";
import {userDatabase} from "../database/UserDatabase";


export class FirebaseAuthService {
    userDataBaseName = DATABASE_USERS;

    eventEmitter = new EventEmitter<string>();
    currentUserUid: string = "";
    started: boolean = false;

    userCache: { [id: string]: UserEntry; } = {};//{uid:userobj}
    userCacheTime: { [id: string]: number; } = {};//{uid:userobj}
    walletValue: RemoteValue = new RemoteValue(0);

    constructor() {
    }

    start() {
        if (this.started) {
            return;
        }
        this.started = true;
        console.log("Firebase auth service started");
        firebase.auth().onAuthStateChanged((user) => {
            if (user == null) {
                this.currentUserUid = "";
                this.eventEmitter.emit('AuthStateChanged', null);
            } else {
                this.currentUserUid = user.uid;
                this.eventEmitter.emit('AuthStateChanged', user.uid);
            }
        });
        this.walletValue.setResync(callback => {
            if (this.currentUserUid && this.currentUserUid !== "") {
                this.computeWalletValue(this.currentUserUid).then(value => {
                    callback(value);
                });
            }
        })
    }

    changeEmail(newEmail: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let user: any = firebase.auth().currentUser;
            if (user == null) {
                reject("user is null");
                return;
            }
            delete this.userCache[user.uid];//invalidate cache
            user.updateEmail(newEmail).then(() => {
                userDatabase.changeEmail(user.uid, newEmail).then(value => {
                    this.eventEmitter.emit('AuthStateChanged', user.uid);
                    resolve("ok")
                }).catch(reason => {
                    reject(reason);
                });
            }).catch((error) => {
                reject(error);
            });
        });
    }

    changePassword(currentPassword: string, newTextValue: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let user: any = firebase.auth().currentUser;
            if (user == null) {
                reject("user is null");
                return "";
            }
            return firebase.auth().signInWithEmailAndPassword(user.email, currentPassword).then((user) => {
                user.updatePassword(newTextValue).then(function () {
                    resolve("ok");
                }).catch(reason => {
                    reject(reason);
                });
            });
        });
    }

    changeDisplayName(newDisplayName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let user: any = firebase.auth().currentUser;
            delete this.userCache[user.uid];//invalidate cache
            userDatabase.changeDisplayName(user.uid,newDisplayName).then(value => {
                this.eventEmitter.emit('AuthStateChanged', user.uid);
                resolve("ok");
            }).catch(reason => {
                reject(reason);
            })
        });
    }

    changeAvatar(newAvatarUrl: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let user: any = firebase.auth().currentUser;
            const httpClient = axios.create();
            httpClient.defaults.timeout = 1000;//ms
            newAvatarUrl = encodeURIComponent(newAvatarUrl);
            httpClient.get(
                GLOBAL_PROPERTIES.USER_SERVICE_CHANGE_AVATAR() + user.uid + "/" + newAvatarUrl)
                .then(response => {
                    delete this.userCache[user.uid];//invalidate cache
                    this.eventEmitter.emit('AuthStateChanged', user.uid);
                    resolve("ok");
                });
        });
    }

    setUserMetadata(key:string,value:string): Promise<string> {
        return new Promise((resolve, reject) => {
            let user: any = firebase.auth().currentUser;
            const httpClient = axios.create();
            httpClient.defaults.timeout = 1000;//ms
            httpClient.post(
                GLOBAL_PROPERTIES.USER_SERVICE_META(),{
                    uid:user.uid,
                    key:key,
                    value:value,
                })
                .then(response => {
                    delete this.userCache[user.uid];//invalidate cache
                    this.eventEmitter.emit('AuthStateChanged', user.uid);
                    resolve("ok");
                });
        });
    }

    register(email: string, pw: string): Promise<string> {
        return new Promise((resolve, reject) => {
            firebase.auth().createUserWithEmailAndPassword(email, pw)
                .then((user) => {
                    this.saveUser(user)
                        .then(() => {
                            this.eventEmitter.emit('AuthStateChanged', user.uid);
                            audit.track("user/register", {uid: user.uid});
                            resolve("ok");
                        })
                        .catch(error => {
                            this.eventEmitter.emit('AuthStateChanged', user.uid);
                            //Save process did fail but register succeeded => user will just have to login again after page is closed
                            audit.reportError(error);
                            resolve("ok");
                        });
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    onAuthStateChanged(callback: (userData: UserEntry) => void): () => void {
        let wrapedCallback = (uid: string) => {
            if (uid == "" || uid == null) {
                callback(USER_ENTRY_NO_VALUE);
                return;
            }
            this.loadUserData(uid).then((data) => {
                this.walletValue.refresh();
                callback(data);
            }).catch(reason => {
                //onAuthStateChanged triggered by firebase before user has been initialized in backend server behavior OK
                callback(USER_ENTRY_NO_VALUE);
            });
        };
        this.eventEmitter.on('AuthStateChanged', wrapedCallback);
        if (this.currentUserUid !== "") {
            this.eventEmitter.emit('AuthStateChanged', this.currentUserUid);//initial call
        }
        return () => {
            this.eventEmitter.off('AuthStateChanged', wrapedCallback)
        };
    }

    transfer(to: string, amount: number): Promise<any> {
        return new Promise<number>((resolve, reject) => {
            const httpClient = axios.create();
            httpClient.defaults.timeout = 20000;//ms
            let from = this.currentUserUid;
            httpClient.get(GLOBAL_PROPERTIES.WALLET_SERVICE_TRANSFER() + "/" + from + "/" + to + "/" + amount).then(response => {
                resolve(response.data.balance);
            }).catch(reason => {
                reject(reason);
            });
        });
    }

    private computeWalletValue(uid: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            userDatabase.loadUserData(uid).then((fireBaseUser) => {
                const httpClient = axios.create();
                httpClient.defaults.timeout = 20000;//ms
                httpClient.get(GLOBAL_PROPERTIES.WALLET_SERVICE_COMPUTE_WALLET() + uid).then(response => {
                    resolve(response.data.balance);
                }).catch(reason => {
                    resolve(fireBaseUser.wallet ? fireBaseUser.wallet.balance : 0);
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    loadUserData(uid: string): Promise<UserEntry> {
        return new Promise<UserEntry>((resolve, reject) => {
            ////
            // START cache management
            ////
            if (this.userCacheTime[uid] === undefined) {
                this.userCacheTime[uid] = 0;
            }
            if (this.userCache[uid] != null && this.userCache[uid] != undefined) {
                resolve(this.userCache[uid]);
                if (!(new Date().getTime() - this.userCacheTime[uid] > 5000)) {
                    //If it has been less than 5 s since last user update just return
                    return;
                }
                //else continue to update user
            }
            this.userCacheTime[uid] = new Date().getTime();//this is to prevent flood request get data while loading
            ////
            // END cache management
            ////
            //Load user
            axios.get(GLOBAL_PROPERTIES.USER_SERVICE_GET() + "/" + uid).then((receivedUserA) => {
                let receivedUser: any = receivedUserA.data;
                let ipfsAvatar = "/static/image/placeholder-image.png";
                if(receivedUser.avatarIid){
                    ipfsAvatar = ipfsFileUploadService.convertIPFSLinkToHttpsLink(receivedUser.avatarIid)
                }else{
                    audit.reportError("receivedUser.avatarIid undefined");
                }
                let userData: UserEntry = {
                    avatarUrl:ipfsAvatar,//TODO undefined
                    email: receivedUser.email,
                    provider: PROVIDER_FIREBASE_MAIL,
                    displayName: receivedUser.displayName,
                    uid: receivedUser.uid,
                    wallet: receivedUser["wallet"] ? receivedUser.wallet.balance : 0,
                    metadata:receivedUser.metadata || {},
                    flag:false,
                };
                this.userCacheTime[uid] = new Date().getTime();
                this.userCache[uid] = userData;
                resolve(userData);
            }).catch(error => {
                audit.reportError("fail to load user data", error);
                reject(error);
            });

        });
    }

    logout(): Promise<string> {
        let ret = firebase.auth().signOut();
        audit.track("user/logout", {uid: this.currentUserUid});
        return ret;
    }

    login(email: string, pw: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            firebase.auth().signInWithEmailAndPassword(email, pw).then((user) => {
                userDatabase.loadUserData(user.uid).then(userValue => {
                    if (userValue === null) {
                        console.warn("user recreated : ", user);
                        this.saveUser(user).then(() => {
                            this.eventEmitter.emit('AuthStateChanged', user.uid);
                            audit.track("user/login", {uid: user.uid});
                            resolve("ok");
                        });
                    } else {
                        resolve("ok");
                    }
                });
                //console.log("logged : ", user);
            }).catch(error => {
                reject(error);
            });
        });
    }

    resetPassword(email: string): Promise<string> {
        return firebase.auth().sendPasswordResetEmail(email)
    }

    private saveUser(user: UserDBEntry): Promise<string> {
        return new Promise((resolve, reject) => {
            //configure default HTTP timeout
            const httpClient = axios.create();
            httpClient.defaults.timeout = 60000;//ms
            httpClient.get(GLOBAL_PROPERTIES.USER_SERVICE_INIT() + "/" + user.uid).then(() => {
                resolve("ok");
            }).catch(error => {
                audit.reportError("fail to init user",error);
                reject(error);
            });
        });
    }

    getLoggedUser(): Promise<UserEntry> {
        if (this.currentUserUid == "" || this.currentUserUid == null) {
            return new Promise<UserEntry>(resolve => {
                resolve(USER_ENTRY_NO_VALUE)
            });
        } else {
            return this.loadUserData(this.currentUserUid);
        }
    }
}

export let firebaseAuthService = new FirebaseAuthService();

