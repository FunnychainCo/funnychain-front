
import {firebaseAuthService} from "../firebase/FirebaseAuthService";
import {steemAuthService} from "../steem/SteemAuthService";
import {steemUserService} from "../steem/SteemUserService";


export interface UserEntry {
    uid: string,
    displayName: string,
    avatarUrl:string,
}

export const USER_ENTRY_NO_VALUE:UserEntry = {
    uid: "",
    displayName: "",
    avatarUrl:"",
};

export interface MailAuthServiceInterface{
    //specific email pasword auth
    changeEmail(newEmail:string):Promise<string>,
    changePassword(currentPassword:string, newTextValue:string):Promise<string>,
    resetPassword(email:string):Promise<string>,

    register(email:string, pw:string):Promise<string>,
    login(email:string, pw:string):Promise<string>,
}

export interface AccountManagementAuthServiceInterface{
    //generic user auth
    onAuthStateChanged(callback:(userData:UserEntry)=>void):()=>void,
    loadUserData(uid:string):Promise<UserEntry>,
    logout():Promise<string>,
}

export interface AuthServiceInterface{
    //generic user auth
    onAuthStateChanged(callback:(userData:UserEntry)=>void):()=>void,
    logout():Promise<string>,
}

export class AuthService implements AuthServiceInterface{

    changeEmail(newEmail:string):Promise<string> {
        return firebaseAuthService.changeEmail(newEmail);
    }

    changePassword(currentPassword:string, newTextValue:string):Promise<string> {
        return firebaseAuthService.changePassword(currentPassword,newTextValue);
    }

    resetPassword(email:string):Promise<string> {
        return firebaseAuthService.resetPassword(email);
    }

    register(email:string, pw:string):Promise<string> {
        return firebaseAuthService.register(email, pw);
    }

    login(email:string, pw:string):Promise<string>{
        return firebaseAuthService.login(email,pw);
    }

    changeDisplayName(newDisplayName:string):Promise<string> {
        return firebaseAuthService.changeDisplayName(newDisplayName);
    }

    changeAvatar(newAvatarIid:string):Promise<string> {
        return firebaseAuthService.changeAvatar(newAvatarIid);
    }

    loadUserData(uid:string):Promise<UserEntry> {
        return steemUserService.loadUserData(uid);
    }

    onAuthStateChanged(callback:(userData:UserEntry)=>void):()=>void {
        return steemAuthService.onAuthStateChanged(callback);
    }

    logout():Promise<string> {
        return steemAuthService.logout();
    }

}

export let authService = new AuthService();
