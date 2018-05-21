import sc2 from 'sc2-sdk';
import * as EventEmitter from "eventemitter3";
import * as store from 'store';
import {AuthServiceInterface, USER_ENTRY_NO_VALUE, UserEntry} from "../generic/AuthService";
import {steemUserService} from "./SteemUserService";

export interface SteemToken {
    access_token:string,
    expires_in:string,
    username:string
}

export const STEEM_TOKEN_NO_VALUE:SteemToken = {
    access_token:"",
    expires_in:"",
    username:""
};

export class SteemAuthService implements AuthServiceInterface{
    sc2Api:any = null;
    steemToken:SteemToken=STEEM_TOKEN_NO_VALUE;
    currentUser:UserEntry=USER_ENTRY_NO_VALUE;

    eventEmitter = new EventEmitter();


    start(){

        //https://www.npmjs.com/package/sc2-sdk
        //https://steemit.com/steemconnect/@noisy/how-to-configure-steemconnect-v2-and-use-it-with-your-application-how-it-works-and-how-it-is-different-from-v1
        let init:any = {
            app: 'funnychain.app',
            callbackURL: 'http://localhost:3000/steem/connect',
            //accessToken: 'access_token',
            scope: ['vote', 'comment']
        };
        let tokenNVM:any = store.get('steem.token') || STEEM_TOKEN_NO_VALUE;
        if(tokenNVM!==STEEM_TOKEN_NO_VALUE){
            this.steemToken = tokenNVM;
            init.accessToken = this.steemToken.access_token;
        }
        console.log("steem token from NVM",this.steemToken);
        this.sc2Api = sc2.Initialize(init);
        this.notifyChange();
    }

    notifyChange(){
        if(this.sc2Api!=null) {
            //check validity of token
            this.sc2Api.me((err, res) => {
                console.log(res)
                if(res){
                    this.eventEmitter.emit('AuthStateChanged', this.steemToken);
                }else{
                    //invalidate steem token
                    store.remove('steem.token');
                    this.steemToken = store.get('steem.token') || STEEM_TOKEN_NO_VALUE;
                    //notify change
                    this.eventEmitter.emit('AuthStateChanged', STEEM_TOKEN_NO_VALUE);
                }
            });
        }else{
            this.eventEmitter.emit('AuthStateChanged', STEEM_TOKEN_NO_VALUE);
        }
    }

    notifyConnexionURL(href) {
        //TODO maybe there is a better way to do that.
        let urlElements = href.split("?");
        urlElements = urlElements[1];
        urlElements = urlElements.split("&");
        //decodeURIComponent
        urlElements.forEach((element)=>{
            element = element.split("=");
            this.steemToken[element[0]]=decodeURIComponent(element[1]);
        });
        console.log("steem token stored to NVM",this.steemToken);
        store.set('steem.token', this.steemToken);
        this.notifyChange();
    }

    getLoginURL(){
        return this.sc2Api.getLoginURL();
        //will get after login => http://localhost:3000/steem/connect/?access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXBwIiwicHJveHkiOiJmdW5ueWNoYWluLmFwcCIsInVzZXIiOiJwaWVycmVoMzciLCJzY29wZSI6WyJ2b3RlIiwiY29tbWVudCJdLCJpYXQiOjE1MjYzMzM3MjEsImV4cCI6MTUyNjkzODUyMX0.j-ouFShCHqKqu0-KoTzzoUZziWzU_czh7mbED9jYmgg&expires_in=604800&username=pierreh37
    }

    logout(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.sc2Api.revokeToken((err, res) => {
                resolve("ok");
                this.notifyChange();
            });
        });
    }

    onAuthStateChanged(callback:(userData:UserEntry)=>void):()=>void {
        let wrapedCallback = (steemToken:SteemToken) => {
            if(steemToken==STEEM_TOKEN_NO_VALUE){
                callback(USER_ENTRY_NO_VALUE);
                return;
            }
            //reload user just in case //TODO maybe not optimized
            if(this.currentUser==USER_ENTRY_NO_VALUE) {
                steemUserService.loadUserData(steemToken.username).then((data) => {
                    callback(data);
                }).catch(reason => {
                    console.error(reason);
                });
            }else{
                //update for future use
                steemUserService.loadUserData(steemToken.username).then((data) => {
                    this.currentUser = data;
                });
                callback(this.currentUser);
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

