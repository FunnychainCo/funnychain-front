import {getWindow, isBrowserRenderMode} from "../service/ssr/windowHelper";

let PROPERTIES = {};

if(isBrowserRenderMode()){
    setProperties(getWindow().GLOBAL_PROPERTIES_JS);
}

function getGlobalProperties(): any {
    return PROPERTIES;
}

export function setProperties(properties:any){
    PROPERTIES=properties;
}

export function isDev(): boolean {
    return !(getGlobalProperties().PROD? (getGlobalProperties().PROD!="false" && getGlobalProperties().PROD!=false):false);
}

//const devHostAPI = "http://127.0.0.1:8085";
//const devHostAPI = "https://alpha.funnychain.co/backend";

const host = () => getGlobalProperties().HOST;
const hostAPI = () => getGlobalProperties().HOST_API;
const hostAPINotification = () => getGlobalProperties().HOST_API;
const hostAPIIPFS = () => getGlobalProperties().HOST_API;
const hostAPIMemeCreator = () => getGlobalProperties().HOST_API;

const serviceUser =() =>hostAPI() +  '/service/user';
const serviceVote =() =>hostAPI() +  '/service/vote';
const serviceMeme =() =>hostAPIMemeCreator() +  '/service/meme';
const serviceReward =() =>hostAPI() +  '/service/reward';
const serviceWallet =() => hostAPI() + '/service/wallet';
const serviceIPFS =() => hostAPIIPFS() + '/service/ipfs';
const serviceNotificationWebpush = () =>hostAPINotification() + '/service/notification/webpush';
//const serviceNotificationWebpush = () =>"http://127.0.0.1:8085/webpush";
const serviceNotification =() =>hostAPINotification() +  '/service/notification';
//const serviceNotification =() =>"http://127.0.0.1:8085";
const serviceComments = () =>hostAPI() + '/service/comments';
const serviceMemes = () =>hostAPI() +  '/service/meme';

export const GLOBAL_PROPERTIES = {
    VERSION: () => "1.7.5",

    //One signal
    ONE_SIGNAL_API_KEY: () => getGlobalProperties().ONE_SIGNAL_API_KEY,
    ONE_SIGNAL_ANDROID_NUMBER: () => getGlobalProperties().ONE_SIGNAL_ANDROID_NUMBER,

    //FIREBASE properties
    apiKey: () => getGlobalProperties().FIREBASE_APIKEY,
    authDomain: () => getGlobalProperties().FIREBASE_AUTH,
    databaseURL: () => getGlobalProperties().FIREBASE_DATABASE_URL,
    projectId: () => getGlobalProperties().FIREBASE_PROJECT_ID,
    storageBucket: () => getGlobalProperties().FIRABSE_STORAGE_BUCKET,
    messagingSenderId: () => getGlobalProperties().FIREBASE_MESSAGING_ID,

    //Web service properties
    FUNNYCHAIN_HOST: () => host(),
    FUNNYCHAIN_SERVICE: () => hostAPI(),
    FUNNYCHAIN_SERVICE_VERSION: () => hostAPI() + "/service/version",

    //Real Time Service
    REAL_TIME_SERVICE_HOST: () => getGlobalProperties().REAL_TIME_DATA_HOST,

    //Meme Service
    MEME_SERVICE: () => serviceMemes(),

    //Reward service
    REWARD_SERVICE_INVEST: () => serviceReward() + "/invest/",//'/invest/:uid/:memeid'
    REWARD_SERVICE_HAS_BET_ON_POST: () => serviceReward() + "/hasBetOnPost/",//'/hasBetOnPost/:uid/:memeid'
    REWARD_SERVICE_COUNT_BET: () => serviceReward() + "/countBet/",//'/countBet/:memeid
    REWARD_SERVICE_GET_BET_POOL: () => serviceReward() + "/getBetPool",//'/getBetPool'

    //Vote service
    VOTE_SERVICE_UPVOTE: () => serviceVote() + "/upvote",// /upvote/:uid/:memeid
    REWARD_SERVICE_HAS_VOTE_ON_POST: () => serviceVote() + "/hasVotedOnPost/",//'/hasVotedOnPost/:uid/:memeid'
    REWARD_SERVICE_COUNT_VOTE: () => serviceVote() + "/countVote/",//'/countVote/:memeid

    //Wallet service
    WALLET_SERVICE: () => serviceWallet(),
    WALLET_SERVICE_COMPUTE_WALLET: () => serviceWallet() + "/compute_wallet/",// '/compute_wallet/:uid'
    WALLET_SERVICE_TRANSFER: () => serviceWallet() + "/transfer",// /transfer/:from/:to/:amount
    WALLET_SERVICE_USER_TRANSACTION: () => serviceWallet() + "/user/transaction",// /user/transfer/:userid

    //user service
    USER_SERVICE_CHANGE_AVATAR: () => serviceUser() + "/avatar/change/",// '/avatar/change/:uid/:url'
    USER_SERVICE_INIT: () => serviceUser() + "/init",// '/init/:uid'
    USER_SERVICE_GET: () => serviceUser() + "/get",// '/get/:uid'
    USER_SERVICE_CHANGE_EMAIL: () => serviceUser() + "/changeEmail",// '/get/:uid'
    USER_SERVICE_CHANGE_DISPLAY_NAME: () => serviceUser() + "/changeDisplayName",// '/get/:uid'
    USER_SERVICE_LOAD_USER_DATA: () => serviceUser() + "/loadUserData/",// '/loadUserData/:uid'
    USER_SERVICE_USER_MEME_KEY: () => serviceUser() + "/getUserMemeKeys/",// '/getUserMemeKeys/:uid'
    USER_SERVICE_META: () => serviceUser() + "/meta/",// '/meta/

    //comments
    COMMENTS_SERVICE: () => serviceComments(),
    COMMENTS_SERVICE_POST: () => serviceComments() + "/post/",// /Post

    ///////////////////////////////
    // other host api
    ///////////////////////////

    //meme service
    MEME_SERVICE_GET_MAP: () => serviceMeme() + "/creator/get/map",// /creator/get/map

    //Notification
    PUSH_NOTIFICATION_SERVICE: () => serviceNotificationWebpush(),
    NOTIFICATION_SERVICE: () => serviceNotification(),

    //upload services
    URL_UPLOAD_SERVICE: () => serviceIPFS() + "/uploadURLtoIPFS",//consume json data {url:string}

};