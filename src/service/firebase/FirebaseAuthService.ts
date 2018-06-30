import {firebaseInitAuthService} from "../firebase/FirebaseInitAuthService";
import axios from 'axios'
import {firebaseMediaService} from "../firebase/FirebaseMediaService";
import {backEndPropetiesProvider} from "../BackEndPropetiesProvider";
import * as firebase from "firebase";
import * as EventEmitter from "eventemitter3";
import {USER_ENTRY_NO_VALUE, UserEntry} from "../generic/UserEntry";

export interface FireBaseUser {
    uid: string;
    photoURL: string;
    avatarIid: string,
    displayName: string,
    email: string,
    avatar: any
}

export class FirebaseAuthService {
    userDataBaseName = "users";

    eventEmitter = new EventEmitter<string>();
    currentUserUid: string = "";

    userCache = {};//{uid:userobj}

    constructor() {
    }

    start(){
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
            this.userCache[user.uid] = null;//invalidate cache
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
            this.userCache[user.uid] = null;//invalidate cache
            firebaseInitAuthService.ref.child(this.userDataBaseName + '/' + user.uid + '/displayName')
                .set(newDisplayName)
                .then(() => {
                    this.eventEmitter.emit('AuthStateChanged', user.uid);
                    resolve("ok");
                });
        });
    }

    changeAvatar(newAvatarIid: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let user: any = firebase.auth().currentUser;
            this.userCache[user.uid] = null;//invalidate cache
            firebaseInitAuthService.ref.child(this.userDataBaseName + '/' + user.uid + '/avatarIid')
                .set(newAvatarIid)
                .then(() => {
                    this.eventEmitter.emit('AuthStateChanged', user.uid);
                    resolve("ok");
                });
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
                            reject(error);
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
        wrapedCallback(this.currentUserUid);//initial call
        return () => {
            this.eventEmitter.off('AuthStateChanged', wrapedCallback)
        };
    }

    loadUserData(uid: string): Promise<UserEntry> {
        return new Promise<UserEntry>((resolve, reject) => {
            if (this.userCache[uid] != null && this.userCache[uid] != undefined) {
                resolve(this.userCache[uid]);//continue to update user
            }
            firebase.database().ref(this.userDataBaseName + "/" + uid).once("value").then((user) => {
                let userData = user.val();
                if (userData == null) {
                    reject("");
                    return;
                }
                firebaseMediaService.loadMediaEntry(userData.avatarIid).then((avatar) => {
                    userData.avatar = avatar;
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

    login(email: string, pw: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            firebaseInitAuthService.firebaseAuth().signInWithEmailAndPassword(email, pw).then((user) => {
                firebase.database().ref(this.userDataBaseName + "/" + user.uid).once("value").then((userData) => {
                    let userValue = userData.val();
                    if (userValue === null) {
                        console.warn("user recreated : ", user);
                        this.saveUser(user).then(() => {
                            this.eventEmitter.emit('AuthStateChanged', user.uid);
                            resolve("ok");
                        });
                    } else {
                        resolve("ok");
                    }
                });
                console.log("logged : ", user);
            }).catch(error => {
                reject(error);
            });
        });
    }

    resetPassword(email: string): Promise<string> {
        return firebaseInitAuthService.firebaseAuth().sendPasswordResetEmail(email)
    }

    saveUser(user: FireBaseUser): Promise<string> {
        return new Promise((resolve, reject) => {
            let userNamePromised;
            let iidPromised;
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
            if (user.photoURL !== null) {
                //TODO implement this case
                iidPromised = new Promise((resolve, reject) => {
                    firebaseMediaService.createMediaEntry(user.photoURL, user.uid).then((fileId) => {
                        resolve(fileId);
                    });
                });
            } else {
                iidPromised = new Promise((resolve, reject) => {
                    const httpClient = axios.create();
                    httpClient.defaults.timeout = 20000;//ms
                    httpClient.get(backEndPropetiesProvider.getProperty('AVATAR_GENERATION_SERVICE')).then(response => {
                        let url = response.data;
                        firebaseMediaService.createMediaEntry(url, user.uid).then((fileId) => {
                            resolve(fileId);
                        });
                    }).catch(error => {
                        console.error("fail to generate user name");
                        reject("fail to generate user name");//TODO default avatar in this case
                    });
                });
            }
            userNamePromised.then(username => {
                iidPromised.then(iid => {
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

    getLoggedUser():Promise<UserEntry> {
        if (this.currentUserUid == "" || this.currentUserUid == null) {
            return new Promise<UserEntry>(resolve => {resolve(USER_ENTRY_NO_VALUE)});
        }else {
            return this.loadUserData(this.currentUserUid);
        }
    }
}

export let firebaseAuthService = new FirebaseAuthService();

