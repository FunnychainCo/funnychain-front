import {firebaseAuthService} from "../firebase/FirebaseAuthService";
import {steemConnectAuthService} from "../steem/steemConnect/SteemConnectAuthService";
import {USER_ENTRY_NO_VALUE, UserEntry} from "./UserEntry";
import * as EventEmitter from "eventemitter3";
import * as store from 'store';
import {UserActionInterface} from "./ApplicationInterface";
import {steemConnectActionService} from "../steem/steemConnect/SteemConnectActionService";
import {dsteemActionService} from "../steem/steemComunity/DsteemActionService";
import {steemCommunityAccountService} from "../steem/steemComunity/SteemCommunityAccountService";

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
    readonly MODE_STEEM:string = "STEEM";
    readonly MODE_EMAIL:string = "EMAIL";
    readonly MODE_UNDEFINDED:string = "UNDEFINED";
    readonly STORAGE_KEY_AUTH_METHOD:string = "fc.auth.method";
    mode:string = this.MODE_UNDEFINDED;
    readonly AUTH_EVENTNAME:string = "AuthService.AuthStateChanged";
    eventEmitter = new EventEmitter();
    private removeAuthListener: () => void = () => {
    };

    start() {
        let mode: string = store.get(this.STORAGE_KEY_AUTH_METHOD) || this.MODE_UNDEFINDED;
        console.log("auth mode : "+mode);
        this.switchMode(mode);
    }

    changeEmail(newEmail: string): Promise<string> {
        if (this.mode != this.MODE_EMAIL) {
            throw new Error("invalid mode");
        }
        return firebaseAuthService.changeEmail(newEmail);
    }

    changePassword(currentPassword: string, newTextValue: string): Promise<string> {
        if (this.mode != this.MODE_EMAIL) {
            throw new Error("invalid mode");
        }
        return firebaseAuthService.changePassword(currentPassword, newTextValue);
    }

    resetPassword(email: string): Promise<string> {
        if (this.mode != this.MODE_EMAIL) {
            throw new Error("invalid mode");
        }
        return firebaseAuthService.resetPassword(email);
    }

    register(email: string, pw: string): Promise<string> {
        this.switchMode(this.MODE_EMAIL);
        return firebaseAuthService.register(email, pw);
    }

    loginEmailPassword(email: string, password: string): Promise<string> {
        return this.login(this.MODE_EMAIL, JSON.stringify({email: email, password: password}));
    }

    login(mode: string, authToken: string): Promise<string> {
        this.switchMode(mode);
        switch (mode) {
            case this.MODE_EMAIL:
                let parse = JSON.parse(authToken);
                return firebaseAuthService.login(parse.email, parse.password);
            case this.MODE_STEEM:
                return steemConnectAuthService.notifyConnexionURL(authToken);
            default:
                throw new Error("invalid mode");
        }
    }

    switchMode(mode: string):void{
        this.mode = mode;
        store.set(this.STORAGE_KEY_AUTH_METHOD, this.mode);
        this.removeAuthListener();
        switch (this.mode) {
            case this.MODE_EMAIL:
                firebaseAuthService.start();
                this.removeAuthListener = firebaseAuthService.onAuthStateChanged((userDataReceived: UserEntry) => {
                    if (this.mode == this.MODE_EMAIL) {
                        steemCommunityAccountService.start(userDataReceived);
                        this.eventEmitter.emit(this.AUTH_EVENTNAME, userDataReceived);
                    } else {
                        throw new Error("invalid mode");
                    }
                });
                break;
            case this.MODE_STEEM:
                steemConnectAuthService.start();
                this.removeAuthListener = steemConnectAuthService.onAuthStateChanged(userDataReceived => {
                    if (this.mode == this.MODE_STEEM) {
                        steemConnectActionService.start();
                        this.eventEmitter.emit(this.AUTH_EVENTNAME, userDataReceived);
                    } else {
                        throw new Error("invalid mode");
                    }
                });
                break;
            default: {
                this.eventEmitter.emit(this.AUTH_EVENTNAME, USER_ENTRY_NO_VALUE);
                break;
            }
        }
    }

    changeDisplayName(newDisplayName: string): Promise<string> {
        if (this.mode != this.MODE_EMAIL) {
            throw new Error("invalid mode");
        }
        return firebaseAuthService.changeDisplayName(newDisplayName);
    }

    changeAvatar(newAvatarUrl: string): Promise<string> {
        if (this.mode != this.MODE_EMAIL) {
            throw new Error("invalid mode");
        }
        return firebaseAuthService.changeAvatar(newAvatarUrl);
    }

    getUserAction():UserActionInterface{
        switch (this.mode) {
            case this.MODE_STEEM:
                return steemConnectActionService;
                break;
            case this.MODE_EMAIL:
                return dsteemActionService;
                break;
            default:
                throw new Error("invalid mode");
        }
    }

    getLoggedUser(): Promise<UserEntry> {
        switch (this.mode) {
            case this.MODE_EMAIL:
                let loggedUser = firebaseAuthService.getLoggedUser();
                loggedUser.catch(()=>{
                    this.logout();//if this fail it means the current user is invalid we have to logout to recreate a new user at login
                });
                return loggedUser;
            case this.MODE_STEEM:
                let loggedUser1 = steemConnectAuthService.getLoggedUser();
                loggedUser1.catch(()=>{
                    this.logout();//if this fail it means the current user is invalid we have to logout to recreate a new user at login
                });
                return loggedUser1;
            default:
                return new Promise<UserEntry>(resolve => {
                    resolve(USER_ENTRY_NO_VALUE);
                });
        }
    }

    /**
     *
     * @param {(userData: UserEntry) => void} callback
     * @returns {() => void} A method to unregister this listener
     */
    onAuthStateChanged(callback: (userData: UserEntry) => void): () => void {
        let wrapedCallback = (userDataReceived: UserEntry) => {
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
        switch (this.mode) {
            case this.MODE_STEEM:
                return new Promise<string>(resolve => {
                    steemConnectAuthService.logout().then(() => {
                        this.switchMode(this.MODE_UNDEFINDED);
                        resolve("ok");
                    });
                });
                break;
            case this.MODE_EMAIL:
                return new Promise<string>(resolve => {
                    firebaseAuthService.logout().then(() => {
                        this.switchMode(this.MODE_UNDEFINDED);
                        resolve("ok");
                    });
                });
                break;
            default:
                throw new Error("invalid mode");
        }
    }

}

export let authService = new AuthService();
