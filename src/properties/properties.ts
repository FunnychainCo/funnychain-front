declare let window:any;

function getGlobalProperties():any{
    return window.GLOBAL_PROPERTIES_JS
}

function isDev(): boolean {
    let href = window.location.href;
    return href.startsWith("http://localhost:") || href.startsWith("http://127.0.0.1:")
}


//const devHostAPI = "http://127.0.0.1:8085";
const devHostAPI = "https://alpha.funnychain.co/backend";
const hostAPI = ()=>isDev()?devHostAPI:getGlobalProperties().hostAPI;

const serviceUser = '/service/user';
const serviceVote = '/service/vote';
const serviceMeme = '/service/meme';
const serviceReward = '/service/reward';
const serviceWallet = '/service/wallet';
const serviceIPFS = '/service/ipfs';

export const GLOBAL_PROPERTIES = {
    VERSION:()=> "1.4.1",

    MIXPANEL_ACTIVATED: ()=> getGlobalProperties().mixpanelActivated,

    //Web service properties
    FUNNYCHAIN_SERVICE:()=> hostAPI(),
    FUNNYCHAIN_SERVICE_VERSION: () => hostAPI()+"/service/version",

    //Reward service
    REWARD_SERVICE_INVEST:()=> hostAPI()+serviceReward+"/invest/",//'/invest/:uid/:memeid'

    //meme service
    MEME_SERVICE_GET_MAP:()=> hostAPI()+serviceMeme+"/creator/get/map",// /creator/get/map

    //Vote service
    VOTE_SERVICE_UPVOTE:()=> hostAPI()+serviceVote+"/upvote",// /upvote/:uid/:memeid

    //Wallet service
    WALLET_SERVICE_COMPUTE_WALLET:()=> hostAPI()+serviceWallet+"/compute_wallet/",// '/compute_wallet/:uid'
    WALLET_SERVICE_TRANSFER:()=> hostAPI()+serviceWallet+"/transfer",// /transfer/:from/:to/:amount
    WALLET_SERVICE_USER_TRANSACTION:()=> hostAPI()+serviceWallet+"/user/transaction",// /user/transfer/:userid

    //user service
    USER_SERVICE_CHANGE_AVATAR:()=> hostAPI()+serviceUser+"/avatar/change/",// '/avatar/change/:uid/:url'
    USER_SERVICE_INIT:()=> hostAPI()+serviceUser+"/init",// '/init/:uid'
    USER_SERVICE_GET:()=> hostAPI()+serviceUser+"/get",// '/get/:uid'

    //Notification and upload services
    PUSH_NOTIFICATION_SERVICE:()=> hostAPI(),
    URL_UPLOAD_SERVICE:()=> hostAPI()+serviceIPFS+"/uploadURLtoIPFS",//consume json data {url:string}

    vapidPublicKey:()=> "BO7gTNODQ9ECFWDZfbDDRcM_jKfc63qS5jREcz8y-BnFsQz5ooPvPmUNsbx3vXvHXXDAQ9XxzvyHTRMrrnzg92I",//TODO get from distant address

    //FIREBASE properties
    apiKey:()=> getGlobalProperties().apiKey,
    authDomain:()=> getGlobalProperties().authDomain,
    databaseURL:()=> getGlobalProperties().databaseURL,
    projectId:()=> getGlobalProperties().projectId,
    storageBucket:()=> getGlobalProperties().storageBucket,
    messagingSenderId:()=> getGlobalProperties().messagingSenderId
};