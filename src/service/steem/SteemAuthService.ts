import sc2 from 'sc2-sdk';
import * as EventEmitter from "eventemitter3";
import * as store from 'store';
import {AuthServiceInterface, USER_ENTRY_NO_VALUE, UserEntry} from "../generic/AuthService";
import {steemUserService} from "./SteemUserService";

export interface SteemToken {
    access_token: string,
    expires_in: string,
    username: string
}

export const STEEM_TOKEN_NO_VALUE: SteemToken = {
    access_token: "",
    expires_in: "",
    username: ""
};

export class SteemAuthService implements AuthServiceInterface {
    private _sc2Api: any = null;
    steemToken: SteemToken = STEEM_TOKEN_NO_VALUE;
    private _currentUser: UserEntry = USER_ENTRY_NO_VALUE;

    eventEmitter = new EventEmitter();

    constructor(){
        this._currentUser = USER_ENTRY_NO_VALUE;
    }

    start() {

        //https://www.npmjs.com/package/sc2-sdk
        //https://steemit.com/steemconnect/@noisy/how-to-configure-steemconnect-v2-and-use-it-with-your-application-how-it-works-and-how-it-is-different-from-v1
        let host = window.location.hostname;
        let port = window.location.port;
        if(port!="80" && port!="443"){
            host = host+":"+port;
        }
        let callBackUrl = "/steem/connect"
        if(window.location.href.startsWith("https")){
            callBackUrl = "https://" + host + callBackUrl;
        }else{
            callBackUrl = "http://" + host + callBackUrl;
        }
        let init: any = {
            app: 'funnychain.app',
            callbackURL: callBackUrl,
            //accessToken: 'access_token',
            scope: ['vote', 'comment']
        };
        let tokenNVM: any = store.get('steem.token') || STEEM_TOKEN_NO_VALUE;
        if (tokenNVM !== STEEM_TOKEN_NO_VALUE) {
            this.steemToken = tokenNVM;
            init.accessToken = this.steemToken.access_token;
        }
        console.log("steem token from NVM",this.steemToken);
        this._sc2Api = sc2.Initialize(init);
        this.notifyChange();
    }

    get sc2Api(): any {
        return this._sc2Api;
    }


    get currentUser(): UserEntry {
        if(this._currentUser==undefined) {
            //TODO workaround for strange bug (strange bug with component dependencies)
            this._currentUser = USER_ENTRY_NO_VALUE;
        }
        return this._currentUser;
    }

    notifyChange() {
        if (this._sc2Api != null && this.steemToken!=STEEM_TOKEN_NO_VALUE) {
            //check validity of token
            this._sc2Api.me((err, res) => {
                console.log(res)
                if (res) {
                    steemUserService.loadUserData(this.steemToken.username).then((data) => {
                        this._currentUser = data;//update cache
                        this.eventEmitter.emit('AuthStateChanged', this.steemToken);
                    });
                } else {
                    //invalidate steem token
                    store.remove('steem.token');
                    this.steemToken = store.get('steem.token') || STEEM_TOKEN_NO_VALUE;
                    //notify change
                    this.eventEmitter.emit('AuthStateChanged', STEEM_TOKEN_NO_VALUE);
                }
            });
        } else {
            this.eventEmitter.emit('AuthStateChanged', STEEM_TOKEN_NO_VALUE);
        }
    }

    notifyConnexionURL(href) {
        //TODO maybe there is a better way to do that.
        let urlElements = href.split("?");
        urlElements = urlElements[1];
        urlElements = urlElements.split("&");
        //decodeURIComponent
        urlElements.forEach((element) => {
            element = element.split("=");
            this.steemToken[element[0]] = decodeURIComponent(element[1]);
        });
        this.sc2Api.sc2.setAccessToken(this.steemToken.access_token);
        console.log("steem token stored to NVM", this.steemToken);
        store.set('steem.token', this.steemToken);
        this.notifyChange();
    }

    getLoginURL() {
        return this._sc2Api.getLoginURL();
        //will get after login => http://localhost:3000/steem/connect/?access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXBwIiwicHJveHkiOiJmdW5ueWNoYWluLmFwcCIsInVzZXIiOiJwaWVycmVoMzciLCJzY29wZSI6WyJ2b3RlIiwiY29tbWVudCJdLCJpYXQiOjE1MjYzMzM3MjEsImV4cCI6MTUyNjkzODUyMX0.j-ouFShCHqKqu0-KoTzzoUZziWzU_czh7mbED9jYmgg&expires_in=604800&username=pierreh37
    }

    logout(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this._sc2Api.revokeToken((err, res) => {
                resolve("ok");
                this.notifyChange();
            });
        });
    }

    onAuthStateChanged(callback: (userData: UserEntry) => void): () => void {
        let wrapedCallback = (steemToken: SteemToken) => {
            if (steemToken == STEEM_TOKEN_NO_VALUE) {
                callback(USER_ENTRY_NO_VALUE);
                return;
            }
            //reload user just in case //TODO maybe not optimized
            if (this.currentUser == USER_ENTRY_NO_VALUE) {
                steemUserService.loadUserData(steemToken.username).then((data) => {
                    callback(data);
                    this._currentUser = data;//update cache
                }).catch(reason => {
                    console.error(reason);
                });
            } else {
                //update for future use
                steemUserService.loadUserData(steemToken.username).then((data) => {
                    if(data!==undefined && data!==null) {
                        this._currentUser = data;//update cache
                    }else{
                        console.error(data);
                    }
                });
                callback(Object.assign({}, this.currentUser));//TODO maybe a better way to deepcopy
            }
        };
        this.eventEmitter.on('AuthStateChanged', wrapedCallback);
        wrapedCallback(this.steemToken);//initial call
        return () => {
            this.eventEmitter.off('AuthStateChanged', wrapedCallback)
        };
    }

}

export let steemAuthService = new SteemAuthService();

