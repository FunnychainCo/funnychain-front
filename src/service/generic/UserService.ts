import {firebaseAuthService} from "../firebase/FirebaseAuthService";
import {steemUserService} from "../steem/SteemUserService";
import {UserEntry} from "./UserEntry";

export class UserService {

    loadUserData(uid: string): Promise<UserEntry> {
        //TODO find/make a better discriminent for uid
        if(uid.length===28){
            //firebase
            return firebaseAuthService.loadUserData(uid);
        }else{
            //steam
            return steemUserService.loadUserData(uid);
        }
    }
}

export let userService = new UserService();