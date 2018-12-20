import {firebaseAuthService} from "../firebase/FirebaseAuthService";
import {UserEntry} from "./UserEntry";
import {audit} from "../Audit";

export class UserService {

    loadUserData(uid: string): Promise<UserEntry> {
        if(uid===null || uid==undefined){
            audit.reportError(uid);
        }
        //firebase
        return firebaseAuthService.loadUserData(uid);
    }

    computeWalletValue(uid: string): Promise<number>{
        return firebaseAuthService.computeWalletValue(uid);
    }
}

export let userService = new UserService();