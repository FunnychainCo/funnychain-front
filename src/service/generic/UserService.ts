import {firebaseAuthService} from "../firebase/FirebaseAuthService";
import {steemUserService} from "../steem/SteemUserService";
import {UserEntry} from "./UserEntry";
import {steemCommunityAccountService} from "../steem/steemComunity/SteemCommunityAccountService";
import {audit} from "../Audit";

export class UserService {

    loadUserData(uid: string): Promise<UserEntry> {
        if(uid===null || uid==undefined){
            audit.reportError(uid);
        }
        if(steemCommunityAccountService.isCommunityAccount(uid)){
            //firebase
            return firebaseAuthService.loadUserData(uid);
        }else{
            //steam
            return steemUserService.loadUserData(uid);
        }
    }

    computeWalletValue(uid: string): Promise<number>{
        return firebaseAuthService.computeWalletValue(uid);
    }
}

export let userService = new UserService();