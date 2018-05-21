import sc2 from 'sc2-sdk';
import * as EventEmitter from "eventemitter3";
import * as store from 'store';

export interface SteemToken {
    access_token?:string,
    expires_in?:string,
    username?:string
}

export class SC2AuthService {
    sc2Api:any = null;
    steemToken:SteemToken={};

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
        //TODO load steemToken from NVM
        this.steemToken = store.get('steem.token') || {};
        if(this.steemToken.access_token!==undefined){
            init.accessToken = this.steemToken.access_token;
        }
        console.log("steem token from NVM",this.steemToken);
        this.sc2Api = sc2.Initialize(init);
        this.eventEmitter.emit('ready', null);
    }

    comment(){

    }

    vote(){

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
    }

    getLoginURL(){
        return this.sc2Api.getLoginURL();
        //will get => http://localhost:3000/steem/connect/?access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXBwIiwicHJveHkiOiJmdW5ueWNoYWluLmFwcCIsInVzZXIiOiJwaWVycmVoMzciLCJzY29wZSI6WyJ2b3RlIiwiY29tbWVudCJdLCJpYXQiOjE1MjYzMzM3MjEsImV4cCI6MTUyNjkzODUyMX0.j-ouFShCHqKqu0-KoTzzoUZziWzU_czh7mbED9jYmgg&expires_in=604800&username=pierreh37
    }
}

export let steemAuthService = new SC2AuthService();

