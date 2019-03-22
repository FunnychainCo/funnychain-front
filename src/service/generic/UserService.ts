import {firebaseAuthService} from "../firebase/FirebaseAuthService";
import {UserEntry} from "./UserEntry";
import {audit} from "../log/Audit";
import {RemoteValue} from "../concurency/RemoteValue";

export class UserService {

    loadUserData(uid: string): Promise<UserEntry> {
        if(uid===null || uid==undefined){
            audit.reportError(uid);
        }
        //firebase
        return firebaseAuthService.loadUserData(uid);
    }

    getWalletLink(): RemoteValue{
        return firebaseAuthService.walletValue;
    }


    transfer(to: string, amount:number): Promise<number>{
        return firebaseAuthService.transfer(to,amount);
    }
}

export let userService = new UserService();