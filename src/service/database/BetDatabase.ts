import * as firebase from "firebase";
import {CACHE_DATABASE_META, DATABASE_BETS} from "../database/shared/DBDefinition";
import {audit} from "../log/Audit";

export class BetDatabase {

    hasBetOnPost(memeId: string, uid: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            firebase.database().ref(DATABASE_BETS + "/" + memeId).once("value", (data) => {
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
            firebase.database().ref(DATABASE_BETS + "/" + memeId).once("value", (data) => {
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
            firebase.database().ref(CACHE_DATABASE_META+"/bet_pool").once("value", (data) => {
                resolve(data.val()?data.val().balance:0);
            }).catch(reason => {
                audit.reportError(reason);
                resolve(0);
            });
        })
    }


}

export let betDatabase = new BetDatabase();
