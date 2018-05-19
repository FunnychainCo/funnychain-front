import sc2 from 'sc2-sdk';
import EventEmitter from "eventemitter3/index";
import steem from 'steem';

export class SC2AuthService {
    sc2Api = null;
    /**
     access_token
     expires_in
     username
     */
    steemToken={};

    eventEmitter = new EventEmitter();

    start(){

        //https://www.npmjs.com/package/sc2-sdk
        //https://www.npmjs.com/package/steem
        //https://steemit.com/steemconnect/@noisy/how-to-configure-steemconnect-v2-and-use-it-with-your-application-how-it-works-and-how-it-is-different-from-v1
        var init = {
            app: 'funnychain.app',
            callbackURL: 'http://localhost:3000/steem/connect',
            //accessToken: 'access_token',
            scope: ['vote', 'comment']
        };
        //TODO load steemToken from NVM
        if(this.steemToken.access_token!==undefined){
            init.accessToken = this.steemToken.access_token;
        }
        this.sc2Api = sc2.Initialize(init);
        this.eventEmitter.emit('ready', null);
        //https://steemit.com/steemjs/@morning/steem-api-guide-how-to-get-recent-posts-getdiscussionsbycreated-load-more-and-pagination
        steem.api.getDiscussionsByTrending({"tag": "dmania", "limit": 10}, (err, result) => {
            console.log(err, result);
        });
    }

    comment(){

    }

    vote(){

    }

    notifyConnexionURL(href) {
        //TODO maybe there is a better way to do that.
        var urlElements = href.split("?");
        urlElements = urlElements[1];
        urlElements = urlElements.split("&");
        //decodeURIComponent
        urlElements.forEach((element)=>{
            element = element.split("=");
            this.steemToken[element[0]]=decodeURIComponent(element[1]);
        });
        console.log(this.steemToken);
    }

    getLoginURL(){
        return this.sc2Api.getLoginURL();
        //will get => http://localhost:3000/steem/connect/?access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXBwIiwicHJveHkiOiJmdW5ueWNoYWluLmFwcCIsInVzZXIiOiJwaWVycmVoMzciLCJzY29wZSI6WyJ2b3RlIiwiY29tbWVudCJdLCJpYXQiOjE1MjYzMzM3MjEsImV4cCI6MTUyNjkzODUyMX0.j-ouFShCHqKqu0-KoTzzoUZziWzU_czh7mbED9jYmgg&expires_in=604800&username=pierreh37
    }
}

export var sc2AuthService = new SC2AuthService();

