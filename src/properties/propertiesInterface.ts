export interface GlobalAppProperties{
    MODE:string,

    //Web service properties
    AVATAR_GENERATION_SERVICE:string,
    USERNAME_GENERATION_SERVICE:string,
    FUNNYCHAIN_SERVICE:string,
    WALLET_SERVICE:string,

    //FIREBASE properties
    apiKey: string,
    authDomain: string,
    databaseURL: string,
    projectId: string,
    storageBucket: string,
    messagingSenderId: string
}