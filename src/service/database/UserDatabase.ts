import {UserDBEntry} from "../database/shared/DBDefinition";
import axios from "axios";
import {GLOBAL_PROPERTIES} from "../../properties/properties";
import {audit} from "../log/Audit";

export class UserDatabase {

    changeEmail(uid: string, newEmail: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if(uid==="" || !uid || newEmail==="" ||!newEmail){
                reject(false);
            }else {
                axios.post(GLOBAL_PROPERTIES.USER_SERVICE_CHANGE_EMAIL(),{uid:uid,mail:newEmail}).then(response => {
                    resolve(response.data);
                }).catch(error => {
                    audit.reportError(error);
                });
            }
        });
    }

    changeDisplayName(uid: string, newDisplayName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if(uid==="" || !uid || newDisplayName==="" ||!newDisplayName){
                reject(false);
            }else {
                axios.post(GLOBAL_PROPERTIES.USER_SERVICE_CHANGE_DISPLAY_NAME(),{uid:uid,name:newDisplayName}).then(response => {
                    resolve(response.data);
                }).catch(error => {
                    audit.reportError(error);
                });
            }
        });
    }

    loadUserData(uid: string): Promise<UserDBEntry> {
        return new Promise<UserDBEntry>((resolve, reject) => {
            if(uid==="" ||!uid){
                reject(false);
            }else {
                axios.get(GLOBAL_PROPERTIES.USER_SERVICE_LOAD_USER_DATA() + uid).then(response => {
                    resolve(response.data);
                }).catch(error => {
                    audit.reportError(error);
                });
            }
        });
    }

    getUserMemeKeys(uid: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            if(uid==="" ||!uid){
                reject(false);
            }else {
                axios.get(GLOBAL_PROPERTIES.USER_SERVICE_USER_MEME_KEY() + uid).then(response => {
                    resolve(response.data);
                }).catch(error => {
                    audit.reportError(error);
                });
            }
        });
    }


}

export let userDatabase = new UserDatabase();

