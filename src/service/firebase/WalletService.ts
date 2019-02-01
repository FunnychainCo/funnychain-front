import {FirebaseTransaction} from "./shared/FireBaseDBDefinition";
import {GLOBAL_PROPERTIES} from "../../properties/properties";
import axios from 'axios';

export class WalletService {

    getTransaction(uid: string): Promise<FirebaseTransaction[]> {
        return new Promise(resolve => {
            axios.get(GLOBAL_PROPERTIES.WALLET_SERVICE_USER_TRANSACTION()+"/"+uid).then((resp) => {
                resolve(resp.data);
            });
        });
    }

}

export let walletService = new WalletService();
