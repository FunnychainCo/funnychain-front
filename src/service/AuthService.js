import {firebaseAuthService} from "./FirebaseAuthService";
import axios from 'axios'
import {mediaService} from "./MediaService";
import firebase from "firebase/index";
import PropTypes from "prop-types";
import EventEmitter from 'eventemitter3'
import suggestUsername from '../lib/suggest-username'
import {backEndPropetiesProvider} from "./BackEndPropetiesProvider";

export class AuthService {
    userDataBaseName = "users";
    propTypes = {
        avatarIid: PropTypes.string,
        displayName: PropTypes.string,
        email: PropTypes.string
    };
    propTypesAvatar = {
        avatarIid: PropTypes.string,
        displayName: PropTypes.string,
        email: PropTypes.string,
        uid: PropTypes.string,
        avatar: PropTypes.any
    };
    eventEmitter = new EventEmitter();
    currentUserUid = null;

    constructor() {
        firebaseAuthService.firebaseAuth().onAuthStateChanged((user) => {
            if (user == null) {
                this.currentUserUid = null;
                this.eventEmitter.emit('AuthStateChanged', null);
            } else {
                this.currentUserUid = user.uid;
                this.eventEmitter.emit('AuthStateChanged', user.uid);
            }
        });
    }

    changeEmail(newEmail) {
        return new Promise((resolve, reject) => {
            var user = firebase.auth().currentUser;
            user.updateEmail(newEmail).then(() => {
                firebaseAuthService.ref.child(this.userDataBaseName + '/' + user.uid + '/email')
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

    changePassword(currentPassword, newTextValue) {
        return new Promise((resolve, reject) => {
            var user = firebase.auth().currentUser;
            return firebaseAuthService.firebaseAuth().signInWithEmailAndPassword(user.email, currentPassword).then((user) => {
                user.updatePassword(newTextValue).then(function () {
                    resolve("ok");
                });
            });
        });
    }

    changeDisplayName(newDisplayName) {
        return new Promise((resolve, reject) => {
            var user = firebase.auth().currentUser;
            firebaseAuthService.ref.child(this.userDataBaseName + '/' + user.uid + '/displayName')
                .set(newDisplayName)
                .then(() => {
                    this.eventEmitter.emit('AuthStateChanged', user.uid);
                    resolve("ok");
                });
        });
    }

    changeAvatar(newAvatarIid) {
        return new Promise((resolve, reject) => {
            var user = firebase.auth().currentUser;
            firebaseAuthService.ref.child(this.userDataBaseName + '/' + user.uid + '/avatarIid')
                .set(newAvatarIid)
                .then(() => {
                    this.eventEmitter.emit('AuthStateChanged', user.uid);
                    resolve("ok");
                });
        });
    }

    register(email, pw) {
        return new Promise((resolve, reject) => {
            firebaseAuthService.firebaseAuth().createUserWithEmailAndPassword(email, pw)
                .then((user) => {
                    this.saveUser(user).then(() => {
                        this.eventEmitter.emit('AuthStateChanged', user.uid);
                        resolve("ok");
                    });
                }).catch(error => {
                reject(error);
            });
        });
    }

    onAuthStateChanged(callback) {
        var wrapedCallback = (uid) => {
            if (uid == null) {
                callback(null);
                return;
            }
            this.loadUserData(uid).then((data) => {
                callback(data);
            });
        };
        this.eventEmitter.on('AuthStateChanged', wrapedCallback);
        wrapedCallback(this.currentUserUid);//initial call
        return () => {
            this.eventEmitter.off('AuthStateChanged', callback)
        };
    }

    loadUserData(uid) {
        return new Promise((resolve, reject) => {
            firebase.database().ref(this.userDataBaseName + "/" + uid).once("value").then((user) => {
                var userData = user.val();
                if (userData == null) {
                    resolve(null);
                    return;
                }
                PropTypes.checkPropTypes(this.propTypes, userData, 'prop', 'User');
                mediaService.loadMediaEntry(userData.avatarIid).then((avatar) => {
                    userData.avatar = avatar;
                    resolve(userData);
                });
            }).catch((error) => {
                console.error(error);
                reject(error);
            });
        });
    }

    logout() {
        return firebaseAuthService.firebaseAuth().signOut()
    }

    login(email, pw) {
        return new Promise((resolve, reject) => {
            firebaseAuthService.firebaseAuth().signInWithEmailAndPassword(email, pw).then((user) => {
                firebase.database().ref(this.userDataBaseName + "/" + user.uid).once("value").then((userData) => {
                    var userValue = userData.val();
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

    resetPassword(email) {
        return firebaseAuthService.firebaseAuth().sendPasswordResetEmail(email)
    }

    saveUser(user) {
        return new Promise(resolve => {
            var userNamePromised;
            var iidPromised;
            if (user.displayName !== null) {
                userNamePromised = new Promise((resolve, reject) => {
                    resolve(user.displayName);
                });
            } else {
                userNamePromised = suggestUsername();
            }
            if (user.photoURL !== null) {
                //TODO implement this case
                iidPromised = new Promise((resolve, reject) => {
                    mediaService.createMediaEntry(user.photoURL, user.uid).then((fileId) => {
                        resolve(fileId);
                    });
                });
            } else {
                iidPromised = new Promise((resolve, reject) => {
                    axios.get(backEndPropetiesProvider.getProperty('AVATAR_GENERATION_SERVICE')).then(response => {
                        var url = response.data;
                        mediaService.createMediaEntry(url, user.uid).then((fileId) => {
                            resolve(fileId);
                        });
                    });
                });
            }
            userNamePromised.then(username => {
                iidPromised.then(iid => {
                    firebaseAuthService.ref.child(this.userDataBaseName + '/' + user.uid)
                        .set({
                            uid: user.uid,
                            email: user.email,
                            displayName: username,
                            avatarIid: iid
                        }).then(() => resolve(user));
                });
            });
        });
    }

}

export var authService = new AuthService();
