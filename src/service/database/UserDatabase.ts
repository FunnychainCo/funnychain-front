import * as firebase from "firebase";
import {DATABASE_CACHE_USERS, DATABASE_USERS, UserDBEntry} from "../database/shared/DBDefinition";

export class UserDatabase {

    changeEmail(uid: string, newEmail: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            firebase.database().ref().child(DATABASE_USERS + '/' + uid + '/email')
                .set(newEmail)
                .then(() => {
                    resolve(newEmail)
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    changeDisplayName(uid: string, newDisplayName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            firebase.database().ref().child(DATABASE_USERS + '/' + uid + '/displayName')
                .set(newDisplayName)
                .then(() => {
                    resolve(newDisplayName);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    loadUserData(uid: string): Promise<UserDBEntry> {
        return new Promise<UserDBEntry>((resolve, reject) => {
            firebase.database().ref(DATABASE_USERS + "/" + uid).once("value").then((user) => {
                let fireBaseUser: UserDBEntry = user.val();
                resolve(fireBaseUser);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    getUserMemeKeys(uid: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            let ref = firebase.database().ref(DATABASE_CACHE_USERS + "/" + uid + "/memes");
            ref.once("value", (memes) => {
                let memesVal: string[] = memes.val() || {};
                resolve(memesVal);
            }).catch((err) => {
                reject(err);
            });
        });
    }


}

export let userDatabase = new UserDatabase();

