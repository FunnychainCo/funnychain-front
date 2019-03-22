import {DATABASE_BETS} from "../database/shared/DBDefinition";
import axios from 'axios'
import {audit} from "../log/Audit";
import {GLOBAL_PROPERTIES} from "../../properties/properties";
import {betDatabase} from "../database/BetDatabase";

export class FirebaseBetService {
    dataBase = DATABASE_BETS;

    hasBetOnPost(memeId: string, uid: string): Promise<boolean> {
        return betDatabase.hasBetOnPost(memeId,uid);
    }

    countBet(memeId: string): Promise<number> {
        return betDatabase.countBet(memeId);
    }

    getBetPool():Promise<number>{
        return betDatabase.getBetPool();
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
            axios.get(GLOBAL_PROPERTIES.REWARD_SERVICE_INVEST()+uid+"/"+memeId).then(response => {
                resolve("ok");
            }).catch(error => {
                audit.reportError("fail to bet",error);
                reject("fail to bet");
            });
        });
    }

}

export let firebaseBetService = new FirebaseBetService();
