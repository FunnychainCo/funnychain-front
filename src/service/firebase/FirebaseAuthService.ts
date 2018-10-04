import {firebaseInitAuthService} from "../firebase/FirebaseInitAuthService";
import axios from 'axios'
import {backEndPropetiesProvider} from "../BackEndPropetiesProvider";
import * as firebase from "firebase";
import * as EventEmitter from "eventemitter3";
import {PROVIDER_FIREBASE_MAIL, USER_ENTRY_NO_VALUE, UserEntry} from "../generic/UserEntry";
import {fileUploadService} from "../generic/FileUploadService";
import {DATABASE_USERS, FirebaseUser} from "./shared/FireBaseDBDefinition";

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
        firebaseInitAuthService.firebaseAuth().onAuthStateChanged((user) => {
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
                firebaseInitAuthService.ref.child(this.userDataBaseName + '/' + user.uid + '/email')
                    .set(newEmail)
                    .then(() => {
                        this.eventEmitter.emit('AuthStateChanged', user.uid);
                        resolve("ok")
                    });
            }).catch((error) => {
                console.error(error);
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
            return firebaseInitAuthService.firebaseAuth().signInWithEmailAndPassword(user.email, currentPassword).then((user) => {
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
            firebaseInitAuthService.ref.child(this.userDataBaseName + '/' + user.uid + '/displayName')
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
            delete this.userCache[user.uid];//invalidate cache
            this.eventEmitter.emit('AuthStateChanged', user.uid);
            resolve("ok");
        });
    }

    register(email: string, pw: string): Promise<string> {
        return new Promise((resolve, reject) => {
            firebaseInitAuthService.firebaseAuth().createUserWithEmailAndPassword(email, pw)
                .then((user) => {
                    this.saveUser(user)
                        .then(() => {
                            this.eventEmitter.emit('AuthStateChanged', user.uid);
                            resolve("ok");
                        })
                        .catch(error => {
                            this.eventEmitter.emit('AuthStateChanged', user.uid);
                            //Save process did fail but register succeeded => user will just have to login again after page is closed
                            console.error(error);
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
                console.warn("invalid uid");
                return;
            }
            this.loadUserData(uid).then((data) => {
                callback(data);
            }).catch(reason => {
                console.error(reason);
            });
        };
        this.eventEmitter.on('AuthStateChanged', wrapedCallback);
        if (this.currentUserUid !== "") {
            wrapedCallback(this.currentUserUid);//initial call
        }
        return () => {
            this.eventEmitter.off('AuthStateChanged', wrapedCallback)
        };
    }

    computeWalletValue(uid: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            firebase.database().ref(this.userDataBaseName + "/" + uid).once("value").then((user) => {
                let fireBaseUser: FirebaseUser = user.val();
                if (fireBaseUser == null) {
                    console.error("uid does not exist in database");
                    resolve(0);
                    return;
                }else {
                    const httpClient = axios.create();
                    httpClient.defaults.timeout = 1000;//ms
                    httpClient.get(backEndPropetiesProvider.getProperty("WALLET_SERVICE") + "/compute_wallet/" + uid).then(response => {
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
                let fireBaseUser:FirebaseUser = user.val();
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
                        uid: fireBaseUser.uid,
                        wallet:user["wallet"]?user.wallet:0
                    };
                    this.userCache[uid] = userData;
                    resolve(userData);
                });
            }).catch((error) => {
                console.error(error);
                reject(error);
            });
        });
    }

    logout(): Promise<string> {
        return firebaseInitAuthService.firebaseAuth().signOut()
    }

    integrityAndMigrationScript(user: FirebaseUser) {
        //////////////
        if (user.wallet == undefined) {
            user.wallet = {
                balance: 0,
                    lastUpdate: new Date().getTime()
            }
            firebaseInitAuthService.ref.child(this.userDataBaseName + '/' + user.uid + "/wallet").set(user.wallet);
        }
        ///////////
        if (user.avatarIid.startsWith("0")) {
            this.generateUserAvatarIid(user).then(iid => {
                firebaseInitAuthService.ref.child(this.userDataBaseName + '/' + user.uid)
                    .set({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        avatarIid: iid
                    });
            });
        }
    }

    login(email: string, pw: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            firebaseInitAuthService.firebaseAuth().signInWithEmailAndPassword(email, pw).then((user) => {
                firebase.database().ref(this.userDataBaseName + "/" + user.uid).once("value").then((userData) => {
                    let userValue: FirebaseUser = userData.val();
                    if (userValue === null) {
                        console.warn("user recreated : ", user);
                        this.saveUser(user).then(() => {
                            this.eventEmitter.emit('AuthStateChanged', user.uid);
                            resolve("ok");
                        });
                    } else {
                        this.integrityAndMigrationScript(userValue);
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
        return firebaseInitAuthService.firebaseAuth().sendPasswordResetEmail(email)
    }

    generateUserName(user: FirebaseUser): Promise<string> {
        let userNamePromised;
        if (user.displayName !== null) {
            userNamePromised = new Promise((resolve, reject) => {
                resolve(user.displayName);
            });
        } else {
            userNamePromised = new Promise((resolve, reject) => {
                //configure default HTTP timeout
                const httpClient = axios.create();
                httpClient.defaults.timeout = 20000;//ms
                httpClient.get(backEndPropetiesProvider.getProperty('USERNAME_GENERATION_SERVICE')).then(response => {
                    let username = response.data;
                    resolve(username);
                }).catch(error => {
                    console.error("fail to generate user name");
                    resolve("Toto");
                });
            });
        }
        return userNamePromised;
    }

    generateUserAvatarIid(user: FirebaseUser): Promise<string> {
        let iidPromised;
        iidPromised = new Promise((resolve, reject) => {
            //configure default HTTP timeout
            const httpClient = axios.create();
            httpClient.defaults.timeout = 20000;//ms
            httpClient.get(backEndPropetiesProvider.getProperty('AVATAR_GENERATION_SERVICE')).then(response => {
                let avatarIPFSHash = response.data;
                resolve(avatarIPFSHash);
            }).catch(error => {
                console.error("fail to generate user name");
                resolve("QmZv2L66Taw3gGZPSnmbFVb67AC4GkeFpCUeAKyesYXeYs");
            });
        });
        return iidPromised;
    }

    saveUser(user: FirebaseUser): Promise<string> {
        return new Promise((resolve, reject) => {
            this.generateUserName(user).then(username => {
                this.generateUserAvatarIid(user).then(iid => {
                    console.log("saving generated user :" + username + " - " + iid);
                    firebaseInitAuthService.ref.child(this.userDataBaseName + '/' + user.uid)
                        .set({
                            uid: user.uid,
                            email: user.email,
                            displayName: username,
                            avatarIid: iid
                        })
                        .then(() => resolve("ok"))
                        .catch(error => {
                            reject(error);
                        });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
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

