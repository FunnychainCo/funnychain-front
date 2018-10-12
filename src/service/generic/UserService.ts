import {firebaseAuthService} from "../firebase/FirebaseAuthService";
import {steemUserService} from "../steem/SteemUserService";
import {UserEntry} from "./UserEntry";
import {steemCommunityAccountService} from "../steem/steemComunity/SteemCommunityAccountService";

export class UserService {

    loadUserData(uid: string): Promise<UserEntry> {
        if(uid===null || uid==undefined){
            console.error(uid);
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