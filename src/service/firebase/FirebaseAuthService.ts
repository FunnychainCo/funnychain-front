import axios from 'axios'
import * as firebase from "firebase";
import EventEmitter from "eventemitter3";
import {PROVIDER_FIREBASE_MAIL, USER_ENTRY_NO_VALUE, UserEntry} from "../generic/UserEntry";
import {DATABASE_USERS, FirebaseUser} from "./shared/FireBaseDBDefinition";
import {audit} from "../Audit";
import {GLOBAL_PROPERTIES} from "../../properties/properties";
import {ipfsFileUploadService} from "../IPFSFileUploader/IPFSFileUploadService";


export class FirebaseAuthService {
    userDataBaseName = DATABASE_USERS;

    eventEmitter = new EventEmitter<string>();
    currentUserUid: string = "";
    started: boolean = false;

    userCache: { [id: string]: UserEntry; } = {};//{uid:userobj}
    userCacheTime: { [id: string]: number; } = {};//{uid:userobj}

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
                firebase.database().ref().child(this.userDataBaseName + '/' + user.uid + '/email')
                    .set(newEmail)
                    .then(() => {
                        this.eventEmitter.emit('AuthStateChanged', user.uid);
                        resolve("ok")
                    });
            }).catch((error) => {
                audit.reportError(error);
            });
        });
    }

    changePassword(currentPassword: string, newTextValue: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let user: any = firebase.auth().currentUser;
            if (user == null) {
                reject("user is null");
                return;
            }
            return firebase.auth().signInWithEmailAndPassword(user.email, currentPassword).then((user) => {
                user.updatePassword(newTextValue).then(function () {
                    resolve("ok");
                });
            });
        });
    }

    changeDisplayName(newDisplayName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let user: any = firebase.auth().currentUser;
            delete this.userCache[user.uid];//invalidate cache
            firebase.database().ref().child(this.userDataBaseName + '/' + user.uid + '/displayName')
                .set(newDisplayName)
                .then(() => {
                    this.eventEmitter.emit('AuthStateChanged', user.uid);
                    resolve("ok");
                });
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

    computeWalletValue(uid: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            firebase.database().ref(this.userDataBaseName + "/" + uid).once("value").then((user) => {
                let fireBaseUser: FirebaseUser = user.val();
                if (fireBaseUser == null) {
                    audit.reportError("uid does not exist in database");
                    resolve(0);
                    return;
                } else {
                    const httpClient = axios.create();
                    httpClient.defaults.timeout = 1000;//ms
                    httpClient.get(GLOBAL_PROPERTIES.WALLET_SERVICE_COMPUTE_WALLET() + uid).then(response => {
                        resolve(response.data.balance);
                    }).catch(reason => {
                        resolve(fireBaseUser.wallet ? fireBaseUser.wallet.balance : 0);
                    });
                }
            });
        });
    }

    loadUserData(uid: string): Promise<UserEntry> {
        return new Promise<UserEntry>((resolve, reject) => {
            ////
            // START cache management
            ////
            if(this.userCacheTime[uid] === undefined){
                this.userCacheTime[uid] = 0;
            }
            if (this.userCache[uid] != null && this.userCache[uid] != undefined) {
                resolve(this.userCache[uid]);
                if(!(new Date().getTime()-this.userCacheTime[uid]>5000)){
                    //If it has been less than 5 s since last user update just return
                    return;
                }
                //else continue to update user
            }
            ////
            // END cache management
            ////
            //Load user
            this.userCacheTime[uid] = new Date().getTime();//this is to prevent flood request get data while loading
            axios.get(GLOBAL_PROPERTIES.USER_SERVICE_GET() + "/" + uid).then((receivedUserA) => {
                let receivedUser: any = receivedUserA.data;
                let userData: UserEntry = {
                    avatarUrl: ipfsFileUploadService.convertIPFSLinkToHttpsLink(receivedUser.avatarIid),
                    email: receivedUser.email,
                    provider: PROVIDER_FIREBASE_MAIL,
                    displayName: receivedUser.displayName,
                    uid: receivedUser.uid,
                    wallet: receivedUser["wallet"] ? receivedUser.wallet.balance : 0
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
                firebase.database().ref(this.userDataBaseName + "/" + user.uid).once("value").then((userData) => {
                    let userValue: FirebaseUser = userData.val();
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

    private saveUser(user: FirebaseUser): Promise<string> {
        return new Promise((resolve, reject) => {
            //configure default HTTP timeout
            const httpClient = axios.create();
            httpClient.defaults.timeout = 20000;//ms
            httpClient.get(GLOBAL_PROPERTIES.USER_SERVICE_INIT() + "/" + user.uid).then(() => {
                resolve("ok");
            }).catch(error => {
                audit.reportError("fail to init user");
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

