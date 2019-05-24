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
const devHostAPI = "https://alpha.funnychain.co/backend";
const hostAPI = () => isDev() ? devHostAPI : getGlobalProperties().HOST_API;
const host = () => hostAPI().replace("/backend", "");
const hostAPINotification = () => isDev() ? "https://alpha.funnychain.co/backend" : getGlobalProperties().HOST_API;
const hostAPIIPFS = () => isDev() ? "https://alpha.funnychain.co/backend" : getGlobalProperties().HOST_API;
const hostAPIMemeCreator = () => isDev() ? "https://alpha.funnychain.co/backend" : getGlobalProperties().HOST_API;

const serviceUser = '/service/user';
const serviceVote = '/service/vote';
const serviceMeme = '/service/meme';
const serviceReward = '/service/reward';
const serviceWallet = '/service/wallet';
const serviceIPFS = '/service/ipfs';
const serviceNotificationWebpush = '/service/notification/webpush';
const serviceNotification = '/service/notification';
const serviceComments = '/service/comments';
const serviceMemes = '/service/meme';

export const GLOBAL_PROPERTIES = {
    VERSION: () => "1.6.24",

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
    MEME_SERVICE: () => hostAPI() + serviceMemes,

    //Reward service
    REWARD_SERVICE_INVEST: () => hostAPI() + serviceReward + "/invest/",//'/invest/:uid/:memeid'
    REWARD_SERVICE_HAS_BET_ON_POST: () => hostAPI() + serviceReward + "/hasBetOnPost/",//'/hasBetOnPost/:uid/:memeid'
    REWARD_SERVICE_COUNT_BET: () => hostAPI() + serviceReward + "/countBet/",//'/countBet/:memeid
    REWARD_SERVICE_GET_BET_POOL: () => hostAPI() + serviceReward + "/getBetPool",//'/getBetPool'

    //Vote service
    VOTE_SERVICE_UPVOTE: () => hostAPI() + serviceVote + "/upvote",// /upvote/:uid/:memeid
    REWARD_SERVICE_HAS_VOTE_ON_POST: () => hostAPI() + serviceVote + "/hasVotedOnPost/",//'/hasVotedOnPost/:uid/:memeid'
    REWARD_SERVICE_COUNT_VOTE: () => hostAPI() + serviceVote + "/countVote/",//'/countVote/:memeid

    //Wallet service
    WALLET_SERVICE: () => hostAPI() + serviceWallet,
    WALLET_SERVICE_COMPUTE_WALLET: () => hostAPI() + serviceWallet + "/compute_wallet/",// '/compute_wallet/:uid'
    WALLET_SERVICE_TRANSFER: () => hostAPI() + serviceWallet + "/transfer",// /transfer/:from/:to/:amount
    WALLET_SERVICE_USER_TRANSACTION: () => hostAPI() + serviceWallet + "/user/transaction",// /user/transfer/:userid

    //user service
    USER_SERVICE_CHANGE_AVATAR: () => hostAPI() + serviceUser + "/avatar/change/",// '/avatar/change/:uid/:url'
    USER_SERVICE_INIT: () => hostAPI() + serviceUser + "/init",// '/init/:uid'
    USER_SERVICE_GET: () => hostAPI() + serviceUser + "/get",// '/get/:uid'
    USER_SERVICE_CHANGE_EMAIL: () => hostAPI() + serviceUser + "/changeEmail",// '/get/:uid'
    USER_SERVICE_CHANGE_DISPLAY_NAME: () => hostAPI() + serviceUser + "/changeDisplayName",// '/get/:uid'
    USER_SERVICE_LOAD_USER_DATA: () => hostAPI() + serviceUser + "/loadUserData/",// '/loadUserData/:uid'
    USER_SERVICE_USER_MEME_KEY: () => hostAPI() + serviceUser + "/getUserMemeKeys/",// '/getUserMemeKeys/:uid'
    USER_SERVICE_META: () => hostAPI() + serviceUser + "/meta/",// '/meta/

    //comments
    COMMENTS_SERVICE: () => hostAPI() + serviceComments,
    COMMENTS_SERVICE_POST: () => hostAPI() + serviceComments + "/post/",// /Post

    ///////////////////////////////
    // other host api
    ///////////////////////////

    //meme service
    MEME_SERVICE_GET_MAP: () => hostAPIMemeCreator() + serviceMeme + "/creator/get/map",// /creator/get/map

    //Notification
    PUSH_NOTIFICATION_SERVICE_SUBSCRIBE: () => hostAPINotification() + serviceNotificationWebpush + "/subscribe/",
    NOTIFICATION_SERVICE_MARK_SEEN: () => hostAPINotification() + serviceNotification + "/mark/seen/",///mark/seen/:uid/:hash/
    NOTIFICATION_SERVICE_UNSEEN_NUMBER: () => hostAPINotification() + serviceNotification + "/unseen/number/",// /unseen/number/:uid/
    NOTIFICATION_SERVICE_CLEAR: () => hostAPINotification() + serviceNotification + "/clear/",// /clear/:uid/:hash
    NOTIFICATION_SERVICE_GET_ALL: () => hostAPINotification() + serviceNotification + "/notifications/",// /notifications/:uid/
    NOTIFICATION_SERVICE_GET: () => hostAPINotification() + serviceNotification + "/notification/",// /notification/:uid/:hash


    //upload services
    URL_UPLOAD_SERVICE: () => hostAPIIPFS() + serviceIPFS + "/uploadURLtoIPFS",//consume json data {url:string}

};