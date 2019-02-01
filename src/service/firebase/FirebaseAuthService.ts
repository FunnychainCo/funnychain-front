import axios from 'axios'
import * as firebase from "firebase";
import * as EventEmitter from "eventemitter3";
import {PROVIDER_FIREBASE_MAIL, USER_ENTRY_NO_VALUE, UserEntry} from "../generic/UserEntry";
import {fileUploadService} from "../generic/FileUploadService";
import {DATABASE_USERS, FirebaseUser} from "./shared/FireBaseDBDefinition";
import {audit} from "../Audit";
import {GLOBAL_PROPERTIES} from "../../properties/properties";


export class FirebaseAuthService {
    userDataBaseName = DATABASE_USERS;

    eventEmitter = new EventEmitter<string>();
    currentUserUid: string = "";
    started: boolean = false;

    userCache: { [id: string]: UserEntry; } = {};//{uid:userobj}

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
                GLOBAL_PROPERTIES.USER_SERVICE() + "/avatar/change/" + user.uid + "/" + newAvatarUrl)
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

    transfer(to: string, amount:number): Promise<any> {
        return new Promise<number>((resolve, reject) => {
            const httpClient = axios.create();
            httpClient.defaults.timeout = 20000;//ms
            let from = this.currentUserUid;
            httpClient.get(GLOBAL_PROPERTIES.WALLET_SERVICE_TRANSFER() + "/"+from+"/"+to+"/"+amount).then(response => {
                resolve(response.data.balance);
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
                    httpClient.get(GLOBAL_PROPERTIES.WALLET_SERVICE() + "/compute_wallet/" + uid).then(response => {
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
            if (this.userCache[uid] != null && this.userCache[uid] != undefined) {
                resolve(this.userCache[uid]);//continue to update user
            }
            firebase.database().ref(this.userDataBaseName + "/" + uid).once("value").then((user) => {
                let fireBaseUser: FirebaseUser = user.val();
                let fireBaseUserId: string = user.key;
                if (fireBaseUser == null) {
                    reject("uid does not exist in database");
                    return;
                }
                fileUploadService.getMediaUrlFromImageID(fireBaseUser.avatarIid).then((avatarUrl) => {
                    let userData: UserEntry = {
                        avatarUrl: avatarUrl,
                        email: fireBaseUser.email,
                        provider: PROVIDER_FIREBASE_MAIL,
                        displayName: fireBaseUser.displayName,
                        uid: fireBaseUserId,
                        wallet: fireBaseUser["wallet"] ? fireBaseUser.wallet.balance : 0
                    };
                    this.userCache[uid] = userData;
                    resolve(userData);
                });
            }).catch((error) => {
                audit.reportError(error);
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

