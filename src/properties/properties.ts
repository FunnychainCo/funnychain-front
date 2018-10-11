import {GlobalAppProperties} from "./propertiesInterface";

export const GLOBAL_PROPERTIES:GlobalAppProperties = {
    MODE:"DEV",

    //Web service properties
    FUNNYCHAIN_SERVICE:"http://127.0.0.1:8085",
    WALLET_SERVICE:"http://127.0.0.1:8085"+"/api",
    AVATAR_GENERATION_SERVICE:"http://127.0.0.1:8085"+'/service/avatar'+'/avatar_ipfs',
    USERNAME_GENERATION_SERVICE:"http://127.0.0.1:8085"+'/service/avatar'+'/name',

    /*FUNNYCHAIN_SERVICE:"https://api.funnychain.co",
    WALLET_SERVICE:"https://api.funnychain.co"+"/api",
    AVATAR_GENERATION_SERVICE:"https://api.funnychain.co"+'/service/avatar'+'/avatar_ipfs',
    USERNAME_GENERATION_SERVICE:"https://api.funnychain.co"+'/service/avatar'+'/name',*/

    //FIREBASE properties
    apiKey: "AIzaSyAJC1BLZBe64zPsZHBIVBzGmPvH4FPSunY",
    authDomain: "funnychain-dev.firebaseapp.com",
    databaseURL: "https://funnychain-dev.firebaseio.com",
    projectId: "funnychain-dev",
    storageBucket: "funnychain-dev.appspot.com",
    messagingSenderId: "818676897965"
};