import {audit} from "../log/Audit";
import axios from 'axios'
import {GLOBAL_PROPERTIES} from "../../properties/properties";

export class BetDatabase {

    hasBetOnPost(memeId: string, uid: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            if(uid==="" || !uid || memeId==="" ||!memeId){
                resolve(false);
            }else {
                axios.get(GLOBAL_PROPERTIES.REWARD_SERVICE_HAS_BET_ON_POST() + uid + "/" + memeId).then(response => {
                    resolve(response.data);
                }).catch(error => {
                    audit.reportError(error);
                });
            }
        });
    }

    countBet(memeId: string): Promise<number> {
        return new Promise<number>(resolve => {
            if(memeId==="" ||!memeId){
                resolve(0);
            }else {
                axios.get(GLOBAL_PROPERTIES.REWARD_SERVICE_COUNT_BET() + memeId).then(response => {
                    resolve(response.data);
                }).catch(error => {
                    audit.reportError(error);
                });
            }
        });
    }

    getBetPool():Promise<number>{
        return new Promise(resolve => {
            axios.get(GLOBAL_PROPERTIES.REWARD_SERVICE_GET_BET_POOL()).then(response => {
                resolve(response.data);
            }).catch(error => {
                audit.reportError(error);
            });
        })
    }


}

export let betDatabase = new BetDatabase();
