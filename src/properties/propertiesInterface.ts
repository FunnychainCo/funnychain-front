export interface GlobalAppProperties{
    MODE:string,
    VERSION:string,

    //Web service properties
    AVATAR_GENERATION_SERVICE:string,
    USERNAME_GENERATION_SERVICE:string,
    PUSH_NOTIFICATION_SERVICE:string,
    WALLET_SERVICE_UPVOTE:string,
    FUNNYCHAIN_SERVICE:string,
    WALLET_SERVICE:string,
    USER_SERVICE:string,
    USER_SERVICE_INIT:string,

    //other
    vapidPublicKey:string,

    //FIREBASE properties
    apiKey: string,
    authDomain: string,
    databaseURL: string,
    projectId: string,
    storageBucket: string,
    messagingSenderId: string
}