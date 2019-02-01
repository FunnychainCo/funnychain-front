import * as firebase from "firebase";
import {DATABASE_BETS, DATABASE_META} from "./shared/FireBaseDBDefinition";
import axios from 'axios'
import {audit} from "../Audit";
import {GLOBAL_PROPERTIES} from "../../properties/properties";

export class FirebaseBetService {
    dataBase = DATABASE_BETS;

    hasBetOnPost(memeId: string, uid: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            firebase.database().ref(this.dataBase + "/" + memeId).once("value", (data) => {
                let value: any[] = data.val();
                let userHasVoted = false;
                if(value!=null) {
                    Object.keys(value).forEach(userid => {
                        if (uid === userid) {
                            userHasVoted = true;
                        }
                    });
                }
                resolve(userHasVoted);
            });
        });
    }

    countBet(memeId: string): Promise<number> {
        return new Promise<number>(resolve => {
            firebase.database().ref(this.dataBase + "/" + memeId).once("value", (data) => {
                let value: any[] = data.val();
                if(value==null){
                    resolve(0);
                }else{
                    resolve(Object.keys(value).length);
                }
            }).catch(reason => {
                audit.reportError(reason);
                resolve(0);
            });
        });
    }

    getBetPool():Promise<number>{
        return new Promise(resolve => {
            firebase.database().ref(DATABASE_META+"/bet_pool").once("value", (data) => {
                resolve(data.val()?data.val().balance:0);
            }).catch(reason => {
                audit.reportError(reason);
                resolve(0);
            });
        })
    }

    isBetEnableOnPost(memeId: string): Promise<boolean> {
        return new Promise<boolean>((resolve,reject) => {
            resolve(true);
            /*axios.get(GLOBAL_PROPERTIES.WALLET_SERVICE()+"/isBetEnabledOnPost/"+memeId).then(response => {
                resolve(response.data);
            }).catch(error => {
                audit.reportError(error);
                resolve(false);
            });*/
        });
    }

    bet(memeId: string, uid: string): Promise<string> {
        return new Promise<string>((resolve,reject) => {
            /*firebase.database().ref(this.dataBase + '/' + memeId+"/"+uid).set(new Date().getTime()).then(() => {
                resolve("ok");
            });*/
            axios.get(GLOBAL_PROPERTIES.WALLET_SERVICE()+"/bet/"+uid+"/"+memeId).then(response => {
                resolve("ok");
            }).catch(error => {
                audit.reportError("fail to bet",error);
                reject("fail to bet");
            });
        });
    }

}

export let firebaseBetService = new FirebaseBetService();
