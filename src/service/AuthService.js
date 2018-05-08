import {firebaseAuthService} from "./FirebaseAuthService";
import axios from 'axios'
import {mediaService} from "./MediaService";
import firebase from "firebase/index";
import PropTypes from "prop-types";

const suggestUsername = require('suggest-username');

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


    changeEmail(newEmail) {
        return new Promise((resolve, reject) => {
            var user = firebase.auth().currentUser;
            user.updateEmail(newEmail).then(() => {
                firebaseAuthService.ref.child(this.userDataBaseName + '/' + user.uid + '/email')
                    .set(newEmail)
                    .then(() => resolve("ok"));
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
                .then(() => resolve("ok"));
        });
    }

    changeAvatar(newAvatarIid) {
        return new Promise((resolve, reject) => {
            var user = firebase.auth().currentUser;
            firebaseAuthService.ref.child(this.userDataBaseName + '/' + user.uid+'/avatarIid')
                .set(newAvatarIid)
                .then(() => resolve("ok"));
        });
    }

    auth(email, pw) {
        return firebaseAuthService.firebaseAuth().createUserWithEmailAndPassword(email, pw)
            .then((user) => {
                this.saveUser(user);
            })
    }

    onAuthStateChanged(callback){
        var removeListener = firebaseAuthService.firebaseAuth().onAuthStateChanged((user) => {
            if(user==null){
                callback(null);
            }else {
                this.loadUserData(user.uid).then((data) => {
                    callback(data);
                });
            }
        });
        return removeListener;
    }

    loadUserData(uid) {
        return new Promise((resolve, reject) => {
            firebase.database().ref(this.userDataBaseName + "/" + uid).once("value").then((user) => {
                var userData = user.val();
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
        return firebaseAuthService.firebaseAuth().signInWithEmailAndPassword(email, pw).then((user) => {
            firebase.database().ref(this.userDataBaseName + "/" + user.uid).once("value").then((userData) => {
                var userValue = userData.val();
                if (userValue === null) {
                    console.warn("user recreated : ", user);
                    this.saveUser(user);
                }
            });
            console.log("logged : ", user);
        })
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
                    axios.get('http://avatar.admin.rphstudio.net/').then(response => {
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
                            uid:user.uid,
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
