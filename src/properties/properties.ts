import {GlobalAppProperties} from "./propertiesInterface";

declare let GLOBAL_PROPERTIES_JS:any;

function isDev(): boolean {
    let href = window.location.href;
    return href.startsWith("http://localhost:") || href.startsWith("http://127.0.0.1:")
}

//const devHostAPI = "http://127.0.0.1:8085";
const devHostAPI = "https://alpha.funnychain.co/backend";
const hostAPI = isDev()?devHostAPI:GLOBAL_PROPERTIES_JS.hostAPI;

const serviceAvatar = '/service/avatar';
const serviceUser = '/service/user';
const serviceWallet = '/service/api';

export const GLOBAL_PROPERTIES:GlobalAppProperties = {
    MODE:"DEV",
    VERSION:"1.3.1",

    MIXPANEL_ACTIVATED:GLOBAL_PROPERTIES_JS.mixpanelActivated,

    //Web service properties
    FUNNYCHAIN_SERVICE:hostAPI,
    WALLET_SERVICE:hostAPI+serviceWallet,
    WALLET_SERVICE_UPVOTE:hostAPI+serviceWallet+"/upvote",///upvote/:uid/:memeid
    AVATAR_GENERATION_SERVICE:hostAPI+serviceAvatar+'/avatar_ipfs',
    USERNAME_GENERATION_SERVICE:hostAPI+serviceAvatar+'/name',
    USER_SERVICE:hostAPI+serviceUser,
    USER_SERVICE_INIT:hostAPI+serviceUser+"/init",
    PUSH_NOTIFICATION_SERVICE:hostAPI,

    vapidPublicKey:"BO7gTNODQ9ECFWDZfbDDRcM_jKfc63qS5jREcz8y-BnFsQz5ooPvPmUNsbx3vXvHXXDAQ9XxzvyHTRMrrnzg92I",//TODO get from distant address

    //FIREBASE properties
    apiKey: GLOBAL_PROPERTIES_JS.apiKey,
    authDomain: GLOBAL_PROPERTIES_JS.authDomain,
    databaseURL: GLOBAL_PROPERTIES_JS.databaseURL,
    projectId: GLOBAL_PROPERTIES_JS.projectId,
    storageBucket: GLOBAL_PROPERTIES_JS.storageBucket,
    messagingSenderId: GLOBAL_PROPERTIES_JS.messagingSenderId
};