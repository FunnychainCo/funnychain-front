import * as firebase from "firebase";
import {DATABASE_TRANSACTIONS, FirebaseTransaction} from "./shared/FireBaseDBDefinition";

export class WalletService {

    getTransaction(uid: string): Promise<FirebaseTransaction[]> {
        return new Promise(resolve => {
            let transactionPromiseDST:Promise<FirebaseTransaction[]>;
            let transactionPromiseSRC:Promise<FirebaseTransaction[]>;
            transactionPromiseDST = new Promise(resolve => {
                firebase.database().ref().child(DATABASE_TRANSACTIONS).orderByChild('dst').equalTo(uid).once("value", a => {
                    resolve(a.val());
                })
            });
            transactionPromiseSRC = new Promise(resolve => {
                firebase.database().ref().child(DATABASE_TRANSACTIONS).orderByChild('src').equalTo(uid).once("value", a => {
                    resolve(a.val());
                })
            });
            transactionPromiseDST.then((dstTransactions:FirebaseTransaction[]) => {
                transactionPromiseSRC.then((srcTransactions:FirebaseTransaction[]) => {
                    let res:FirebaseTransaction[] = [];
                    if(dstTransactions!=null){
                        res = res.concat(dstTransactions);
                    }
                    if(srcTransactions!=null){
                        res = res.concat(srcTransactions);
                    }
                    resolve(res);
                });
            });
        });
    }

}

export let walletService = new WalletService();
