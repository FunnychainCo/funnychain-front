import {firebaseAuthService} from "../firebase/FirebaseAuthService";
import {steemAuthService} from "../steem/SteemAuthService";
import {steemUserService} from "../steem/SteemUserService";
import {USER_ENTRY_NO_VALUE, UserEntry} from "./UserEntry";
import * as EventEmitter from "eventemitter3";

export interface MailAuthServiceInterface {
    //specific email pasword auth
    changeEmail(newEmail: string): Promise<string>,

    changePassword(currentPassword: string, newTextValue: string): Promise<string>,

    resetPassword(email: string): Promise<string>,

    register(email: string, pw: string): Promise<string>,

    login(email: string, pw: string): Promise<string>,
}

export interface AccountManagementAuthServiceInterface {
    //generic user auth
    onAuthStateChanged(callback: (userData: UserEntry) => void): () => void,

    loadUserData(uid: string): Promise<UserEntry>,

    logout(): Promise<string>,
}

export interface AuthServiceInterface {
    //generic user auth
    onAuthStateChanged(callback: (userData: UserEntry) => void): () => void,

    logout(): Promise<string>,
}

export class AuthService implements AuthServiceInterface {
    MODE_STEEM = "STEEM";
    MODE_EMAIL = "EMAIL";
    MODE_UNDEFINDED = "UNDEFINED";
    mode:string = this.MODE_UNDEFINDED;
    AUTH_EVENTNAME = "AuthService.AuthStateChanged";
    eventEmitter = new EventEmitter();
    private removeAuthListener: () => void = ()=>{};

    start(){
        steemAuthService.start();
        firebaseAuthService.start();
    }

    changeEmail(newEmail: string): Promise<string> {
        if(this.mode!=this.MODE_EMAIL){
            throw new Error("invalid mode");
        }
        return firebaseAuthService.changeEmail(newEmail);
    }

    changePassword(currentPassword: string, newTextValue: string): Promise<string> {
        if(this.mode!=this.MODE_EMAIL){
            throw new Error("invalid mode");
        }
        return firebaseAuthService.changePassword(currentPassword, newTextValue);
    }

    resetPassword(email: string): Promise<string> {
        if(this.mode!=this.MODE_EMAIL){
            throw new Error("invalid mode");
        }
        return firebaseAuthService.resetPassword(email);
    }

    register(email: string, pw: string): Promise<string> {
        if(this.mode!=this.MODE_EMAIL){
            throw new Error("invalid mode");
        }
        return firebaseAuthService.register(email, pw);
    }

    loginEmailPassword(email: string, password: string): Promise<string> {
        return this.login(this.MODE_EMAIL,JSON.stringify({email:email,password:password}));
    }

    login(mode:string,authToken: string): Promise<string> {
        switch (mode){
            case this.MODE_EMAIL:
                this.mode = mode;
                let parse = JSON.parse(authToken);
                this.removeAuthListener = firebaseAuthService.onAuthStateChanged(userDataReceived => {
                    if(this.mode==this.MODE_EMAIL) {
                        this.eventEmitter.emit(this.AUTH_EVENTNAME, userDataReceived);
                    }else{
                        throw new Error("invalid mode");
                    }
                });
                return firebaseAuthService.login(parse.email, parse.password);
            case this.MODE_STEEM:
                this.mode = mode;
                this.removeAuthListener = steemAuthService.onAuthStateChanged(userDataReceived => {
                    if(this.mode==this.MODE_STEEM) {
                        this.eventEmitter.emit(this.AUTH_EVENTNAME, userDataReceived);
                    }else{
                        throw new Error("invalid mode");
                    }
                });
                return steemAuthService.notifyConnexionURL(authToken);
            default:
                throw new Error("invalid mode");
        }
    }

    changeDisplayName(newDisplayName: string): Promise<string> {
        if(this.mode!=this.MODE_EMAIL){
            throw new Error("invalid mode");
        }
        return firebaseAuthService.changeDisplayName(newDisplayName);
    }

    changeAvatar(newAvatarIid: string): Promise<string> {
        if(this.mode!=this.MODE_EMAIL){
            throw new Error("invalid mode");
        }
        return firebaseAuthService.changeAvatar(newAvatarIid);
    }

    loadUserData(uid: string): Promise<UserEntry> {
        //TODO this api is stupid and should be in a UserService
        if(this.mode!=this.MODE_STEEM){
            return steemUserService.loadUserData(uid);
        }else if(this.mode!=this.MODE_EMAIL){
            return firebaseAuthService.loadUserData(uid);
        }else{
            throw new Error("invalid mode");
        }
    }

    getLoggedUser():Promise<UserEntry> {
        switch (this.mode){
            case this.MODE_EMAIL:
                return firebaseAuthService.getLoggedUser();
            case this.MODE_STEEM:
                return steemAuthService.getLoggedUser();
            default:
                return new Promise<UserEntry>(resolve => {USER_ENTRY_NO_VALUE});
        }
    }

    /**
     *
     * @param {(userData: UserEntry) => void} callback
     * @returns {() => void} A method to unregister this listener
     */
    onAuthStateChanged(callback: (userData: UserEntry) => void): () => void {
        let wrapedCallback = (userDataReceived: UserEntry)=>{
            callback(userDataReceived);
        };
        this.eventEmitter.on(this.AUTH_EVENTNAME, wrapedCallback);
        this.getLoggedUser().then(value => {
            wrapedCallback(value);//initial call
        });
        return () => {
            this.eventEmitter.off(this.AUTH_EVENTNAME, wrapedCallback)
        };
    }

    logout(): Promise<string> {
        if(this.mode!=this.MODE_STEEM) {
            return new Promise<string>(resolve => {
                steemAuthService.logout().then(()=>{
                    this.removeAuthListener();
                    this.mode=this.MODE_UNDEFINDED;
                });
            });
        }else if(this.mode!=this.MODE_EMAIL) {
            return new Promise<string>(resolve => {
                firebaseAuthService.logout().then(()=>{
                    this.removeAuthListener();
                    this.mode=this.MODE_UNDEFINDED;
                });
            });
        }else{
            throw new Error("invalid mode");
        }
    }

}

export let authService = new AuthService();
