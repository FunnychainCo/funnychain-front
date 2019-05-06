import {TransactionDBEntry} from "../database/shared/DBDefinition";
import {GLOBAL_PROPERTIES} from "../../properties/properties";
import axios from 'axios';

export class WalletService {

    getTransaction(uid: string): Promise<TransactionDBEntry[]> {
        return new Promise((resolve,reject) => {
            axios.get(GLOBAL_PROPERTIES.WALLET_SERVICE_USER_TRANSACTION()+"/"+uid).then((resp) => {
                resolve(resp.data);
            }).catch(reason => {
                reject(reason);
            });
        });
    }

    payout(params: { valueeuro: number; valuetoken: number; userid: string; paypallink: string }):Promise<any> {
        return new Promise((resolve,reject) => {
            axios.post(GLOBAL_PROPERTIES.WALLET_SERVICE()+"/payout",params).then((resp) => {
                resolve(resp.data);
            }).catch(reason => {
                reject(reason);
            });
        });
    }

}

export let walletService = new WalletService();
