import {firebaseAuthService} from "../firebase/FirebaseAuthService";
import {USER_ENTRY_NO_VALUE, UserEntry} from "./UserEntry";
import EventEmitter from "eventemitter3";
import store from 'store';
import {UserActionInterface} from "./ApplicationInterface";
import {firebaseActionService} from "../firebase/FirebaseActionService";
import {userNotificationService} from "../UserNotificationService";

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
    readonly AUTH_EVENTNAME:string = "AuthServiceAuthStateChanged2";
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
            default:
                throw new Error("invalid mode");
        }
    }

    updateNotificationStatus(userDataReceived: UserEntry){
        if(userDataReceived!=USER_ENTRY_NO_VALUE){
            userNotificationService.updateNotification(userDataReceived.uid);
        }
    };

    switchMode(mode: string):void{
        this.mode = mode;
        store.set(this.STORAGE_KEY_AUTH_METHOD, this.mode);
        this.removeAuthListener();
        switch (this.mode) {
            case this.MODE_EMAIL:
                firebaseAuthService.start();
                this.removeAuthListener = firebaseAuthService.onAuthStateChanged((userDataReceived: UserEntry) => {
                    this.updateNotificationStatus(userDataReceived);
                    if (this.mode == this.MODE_EMAIL) {
                        firebaseActionService.start(userDataReceived);
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
            case this.MODE_EMAIL:
                //return dsteemActionService;
                return firebaseActionService;
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
        let lastUserData:UserEntry = USER_ENTRY_NO_VALUE;
        let activated:boolean = true;//Note hack event emiter where the event is fired even after off has been called
        let wrapedCallback = (userDataReceived: UserEntry) => {
            if(activated && (JSON.stringify(lastUserData) !== JSON.stringify(userDataReceived))) {
                lastUserData = userDataReceived;
                callback(userDataReceived);
            }
        };
        this.eventEmitter.on(this.AUTH_EVENTNAME, wrapedCallback);
        this.getLoggedUser().then(value => {
            //initial call
            //this.eventEmitter.emit(this.AUTH_EVENTNAME, value);
            if(activated) {
                callback(value);
            }
        });
        return () => {
            activated=false;
            this.eventEmitter.off(this.AUTH_EVENTNAME, wrapedCallback);
        };
    }

    logout(): Promise<string> {
        switch (this.mode) {
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
