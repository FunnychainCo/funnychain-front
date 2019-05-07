import express from 'express';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';

import App, {getTheme, precacheData} from './app/App';
import {setProperties} from "./properties/properties";

import {SheetsRegistry} from 'jss';
import JssProvider from 'react-jss/lib/JssProvider';
import {
    MuiThemeProvider,
    createGenerateClassName,
} from '@material-ui/core/styles';
import {authService} from "./service/generic/AuthService";
import {realTimeData} from "./service/database/RealTimeData";
import {ipfsFileUploadService} from "./service/uploader/IPFSFileUploadService";
import Helmet from 'react-helmet';

let assets: any;

const syncLoadAssets = () => {
    assets = require(process.env.RAZZLE_ASSETS_MANIFEST!);
};
syncLoadAssets();

let PROPERTIES = {

    PROD: process.env.PROD ? process.env.PROD : "false",

    /* funnychain */
    HOST: process.env.APP_HOST ? process.env.APP_HOST : "https://alpha.funnychain.co",//"http:127.0.0.1:8085", //"https://alpha.funnychain.co",
    HOST_API: process.env.HOST_API ? process.env.HOST_API : "https://alpha.funnychain.co/backend",//"http:127.0.0.1:8085", //"https://alpha.funnychain.co/backend",
    REAL_TIME_DATA_HOST: process.env.REAL_TIME_DATA_HOST ? process.env.REAL_TIME_DATA_HOST : "https://alpha.funnychain.co#/backend/socket.io",//"http:127.0.0.1:8085#/socket.io", //"https://alpha.funnychain.co#/backend/socket.io",

    /* one-signal api-key */
    ONE_SIGNAL_API_KEY: process.env.ONE_SIGNAL_API_KEY ? process.env.ONE_SIGNAL_API_KEY : "dc7c1d29-5ea3-4967-baac-a64f0be10c95",
    ONE_SIGNAL_ANDROID_NUMBER: process.env.ONE_SIGNAL_ANDROID_NUMBER ? process.env.ONE_SIGNAL_ANDROID_NUMBER : "818676897965",

    /* google tags id */
    GOOGLE_TAGS_ACTIVATED: process.env.GOOGLE_TAGS_ACTIVATED ? process.env.GOOGLE_TAGS_ACTIVATED : 'false',
    GOOGLE_TAGS_ID: process.env.GOOGLE_TAGS_ID ? process.env.GOOGLE_TAGS_ID : "",
    GOOGLE_TAGS_URL: process.env.GOOGLE_TAGS_URL ? process.env.GOOGLE_TAGS_URL : "",

    /* firebase api */
    FIREBASE_APIKEY: process.env.FIREBASE_APIKEY ? process.env.FIREBASE_APIKEY : "AIzaSyAJC1BLZBe64zPsZHBIVBzGmPvH4FPSunY",
    FIREBASE_AUTH: process.env.FIREBASE_AUTH ? process.env.FIREBASE_AUTH : "funnychain-dev.firebaseapp.com",
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL ? process.env.FIREBASE_DATABASE_URL : "https://funnychain-dev.firebaseio.com",
    FIREBASE_MESSAGING_ID: process.env.FIREBASE_MESSAGING_ID ? process.env.FIREBASE_MESSAGING_ID : "818676897965",
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? process.env.FIREBASE_PROJECT_ID : "funnychain-dev",
    FIRABSE_STORAGE_BUCKET: process.env.FIRABSE_STORAGE_BUCKET ? process.env.FIRABSE_STORAGE_BUCKET : "funnychain-dev.appspot.com"
};

console.log("using properties:", PROPERTIES);
setProperties(PROPERTIES);

//start some service
authService.start();
realTimeData.connect();
ipfsFileUploadService.start();

function singlePageApplicationRenderer(req: express.Request, res: express.Response) {
    console.log(req.url);
    /*
    Compute server data
    * */
    let dataPromise = precacheData(req.url);

    dataPromise.then(() => {

        const context = {};

        // Create a sheetsRegistry instance.
        const sheetsRegistry = new SheetsRegistry();

        // Create a sheetsManager instance.
        const sheetsManager = new Map();

        // Create a theme instance.
        const theme = getTheme();

        // Create a new class name generator.
        const generateClassName = createGenerateClassName();


        const markup = renderToString(
            <JssProvider registry={sheetsRegistry} generateClassName={generateClassName}>
                <MuiThemeProvider theme={theme} sheetsManager={sheetsManager}>
                    <StaticRouter context={context} location={req.url}>
                        <App/>
                    </StaticRouter>
                </MuiThemeProvider>
            </JssProvider>
        );

        // Grab the CSS from our sheetsRegistry.
        const css = sheetsRegistry.toString();
        const helmet = Helmet.renderStatic();

        res.send(renderFullPage(markup, css, helmet));
    });
}

function renderFullPage(markup, css, helmet) {
    let googletagid = PROPERTIES.GOOGLE_TAGS_ID;
    let googletagurl = PROPERTIES.GOOGLE_TAGS_URL;
    return `<!DOCTYPE html>
                <html lang="en" ${helmet.htmlAttributes.toString()}>
                    <head>
                        <!-- start PWA script -->
                        <script type="text/javascript">
                            window._promptEventForPWA = null;
                            window.addEventListener("beforeinstallprompt", function (ev) {
                                console.log("early beforeinstallprompt received");
                                ev.preventDefault();// Stop Chrome from asking _now_
                                window._promptEventForPWA = ev;
                            });
                        </script>
                        <!-- end PWA script -->
                        
                        <!-- start setup properties script -->
                        <script type="text/javascript" src="/static/script/fill.js"></script>
                        <script type="text/javascript">
                            window.GLOBAL_PROPERTIES_JS = ${JSON.stringify(PROPERTIES)};
                        </script>
                        <!-- end setup properties script -->
                        
                        <!-- start One Signal -->
                        <script src="https://cdn.onesignal.com/sdks/OneSignalSDK.js" no-cors async=""></script>
                        <!-- end One Signal -->
                                                                    
                        <!-- Google Tag Manager -->
                        <script>
                            if (window.GLOBAL_PROPERTIES_JS.GOOGLE_TAGS_ACTIVATED === 'true') {
                                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                                })(window,document,'script','dataLayer',"${googletagid}");
                            }
                        </script>
                        <!-- End Google Tag Manager -->
                                                                                                                    
                        <base href="/">
                        
                        <!-- propeller meta tag -->
                        <meta name="propeller" content="35e484e8c2156c93678b440f0538a521">
                        
                        <!-- ionic mobil compliance meta tags -->
                        <meta name="viewport"
                              content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
                        <meta name="format-detection" content="telephone=no"/>
                        <meta name="msapplication-tap-highlight" content="no"/>
                        <meta name="apple-mobile-web-app-capable" content="yes"/><!-- add to homescreen for ios -->
                        <meta name="apple-mobile-web-app-status-bar-style" content="black"/><!-- add to homescreen for ios -->
                        
                        <!-- Start Meta -->
                        <meta charset="utf-8" />
                        <meta name="theme-color" content="#ffffff" />
                        <meta name="msapplication-TileColor" content="#00aba9" />
                               
                        <!-- Customisable helmet tag -->                 
                        ${helmet.title.toString()}
                        ${helmet.meta.toString()}
                        ${helmet.link.toString()}
                        
                        <!-- APP LINK -->
                        <!--
                          manifest.json provides metadata used when your web app is added to the
                          homescreen on Android. See https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/
                        -->
                        <link rel="manifest" href="/manifest.json">
                        
                        <!-- favicon stuff https://realfavicongenerator.net -->
                        <link rel="shortcut icon" href="/favicon.ico">
                        <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon.png">
                        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
                        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
                        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">
                        
                        
                        <!-- APP CODE -->
                        ${process.env.NODE_ENV === 'production' ?
                            `<script src="${assets.client.js}" defer></script>` :
                            `<script src="${assets.client.js}" defer crossorigin></script>`
                        }
                        
                        <!-- APP CSS -->
                        <style id="jss-server-side">${css}</style>
                        <style type="text/css">
                            /* 
                            main 
                            */
                            html, body {
                              height: 100%;
                              margin:0 !important;
                            }
                            
                            #root {
                              height: 100%;
                              display: flex;
                              flex-flow: column;
                            }
                            /*
                            MemeList.css
                             */
                             .memes{
                                max-width:100%;
                            }
                            
                            @media (orientation: landscape) and (min-width:961px){
                                .memes{
                                    max-width:33%;
                                }
                            }
                            
                            .fcContainerScroll{
                                overflow: auto;
                                display: flex;
                                justify-content: center;
                                -webkit-overflow-scrolling: touch;
                            }
                            
                            .fcContentScroll{
                                flex: 1 0 auto;
                            }
                            /*
                            Meme.css
                             */
                             /* default */
                            .fcDynamicWidth{
                                max-width:100%;
                            }
                            
                            @media (orientation: landscape) and (min-width:961px){
                                .fcDynamicWidth{
                                    max-width:33%;
                                }
                            }
                            
                            .fcCenteredContainer{
                                overflow: auto;
                                display: flex;
                                justify-content: center;
                            }
                            
                            .fcCenteredContent{
                                flex: 1 0 auto;
                            }
                            
                            /* other */
                            
                            
                            .memeImage{
                                max-width: 100%;
                                max-height: 100%;
                                min-width: 100%;
                            }
                            
                            .memeExpandButton{
                                margin-left: auto !important;
                            }
                            
                            .memeElementStyleDivContainer{
                                display: flex;
                                align-items:center;
                            }
                            
                            .memeElementStyleDiv{
                                flex: 0 1 auto;
                                margin-top: auto !important;
                                margin-bottom: auto !important;
                                text-align: center;
                            
                                display: flex;
                                align-items:center;
                            }
                            /*
                            ImageUploaderDropZone.css
                             */
                             .dropzoneTextStyle {
                                text-align: center;
                                top: 20%;
                                position: relative;
                            }
                            
                            .uploadIconSize {
                                width: 51px !important;
                                height: 51px !important;
                                color: #909090 !important;
                            }
                            
                            .dropzoneParagraph {
                                font-size: 24px
                            }
                            
                            .fcImageContainerStyle{
                                max-width: 100%;
                            }
                            
                            .dropZone {
                                position: relative;
                                width: 100%;
                                min-height: 200px;
                                background-color: #F0F0F0;
                                border: dashed;
                                border-color: #C8C8C8;
                                cursor: pointer;
                            }
                            
                            .stripes {
                                width: 100%;
                                height: 250px;
                                cursor: pointer;
                                border: solid;
                                border-color: #C8C8C8;
                                background-image: repeating-linear-gradient(-45deg, #F0F0F0, #F0F0F0 25px, #C8C8C8 25px, #C8C8C8 50px);
                                -webkit-animation: progress 2s linear infinite !important;
                                -moz-animation: progress 2s linear infinite !important;
                                animation: progress 2s linear infinite !important;
                                background-size: 150% 100%;
                            }
                            
                            .rejectStripes {
                                width: 100%;
                                height: 250px;
                                cursor: pointer;
                                border: solid;
                                border-color: #C8C8C8;
                                background-image: repeating-linear-gradient(-45deg, #fc8785, #fc8785 25px, #f4231f 25px, #f4231f 50px);
                                -webkit-animation: progress 2s linear infinite !important;
                                -moz-animation: progress 2s linear infinite !important;
                                animation: progress 2s linear infinite !important;
                                background-size: 150% 100%;
                            }
                            
                            .fileIconImg {
                                color: #909090 !important;
                            }
                            
                            .smallPreviewImg {
                                height: 100px !important;
                                width: initial !important;
                                max-width: 100%;
                                margin-top: 5px;
                                margin-right: 10px;
                                color: rgba(0, 0, 0, 0.87);
                                transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms !important;
                                box-sizing: border-box;
                                -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
                                box-shadow: rgba(0, 0, 0, 0.12) 0 1px 6px, rgba(0, 0, 0, 0.12) 0 1px 4px !important;
                                border-radius: 2px;
                                z-index: 5;
                            }
                            
                            @-webkit-keyframes progress {
                                0% {
                                    background-position: 0 0;
                                }
                                100% {
                                    background-position: -75px 0;
                                }
                            }
                            
                            @-moz-keyframes progress {
                                0% {
                                    background-position: 0 0;
                                }
                                100% {
                                    background-position: -75px 0;
                                }
                            }
                            
                            @-ms-keyframes progress {
                                0% {
                                    background-position: 0 0;
                                }
                                100% {
                                    background-position: -75px 0;
                                }
                            }
                            
                            @keyframes progress {
                                0% {
                                    background-position: 0 0;
                                }
                                100% {
                                    background-position: -70px 0;
                                }
                            }
                            
                            .imageContainer {
                                position: relative;
                                z-index: 10;
                            }
                            
                            .imageContainer:hover .smallPreviewImg {
                                opacity: 0.3;
                            }
                            
                            .imageContainer:hover .middle {
                                opacity: 1;
                            }
                            
                            .imageContainer:hover .middleBigPic {
                                opacity: 1;
                            }
                            
                            .removeBtn {
                                color: white;
                                margin-left: 5px;
                                z-index: 3;
                            }
                            
                            .middle {
                                transition: .5s ease;
                                opacity: 0;
                                position: absolute;
                                top: 20px;
                                left: 5px;
                                transform: translate(-50%, -50%);
                                -ms-transform: translate(-50%, -50%)
                            }
                            
                            .row {
                                margin-right: -0.5rem;
                                margin-left: -0.5rem;
                                box-sizing: border-box;
                                display: -webkit-box;
                                display: -ms-flexbox;
                                display: flex;
                                flex: 0 1 auto;
                                -webkit-box-flex: 0;
                                -ms-flex: 0 1 auto;
                                -webkit-box-orient: horizontal;
                                -webkit-box-direction: normal;
                                -ms-flex-direction: row;
                                flex-direction: row;
                                -ms-flex-wrap: wrap;
                                flex-wrap: wrap;
                            }
                            /**
                            Account.css
                             */
                             .accountPaperWidth{
                                max-width:100%;
                            }
                            
                            .accountPaper{
                                margin: 20px;
                            }
                            
                            .fcCenteredContainer{
                                overflow: auto;
                                display: flex;
                                justify-content: center;
                            }
                            
                            .fcLeftAlignContainer{
                                overflow: auto;
                                display: flex;
                                flex-direction: column;
                                justify-content: left;
                            }
                            
                            
                            .fcAvatarContent{
                                margin: 20px;
                                width: 150px !important;
                                height: 150px !important;
                            }
                            
                            .fcContent{
                                flex: 0 1 auto;
                                overflow: hidden;
                            }
                            
                            .fcEditButton{
                                width: auto !important;
                                height: auto !important;
                            }
                        </style>
                        
                        <!-- PopAds.net Popunder Code for funnychain.co | 2019-05-07,3330037,0.0005,5 -->
                        <script type="text/javascript" data-cfasync="false">
                        /*<![CDATA[/* */
                        /* Privet darkv. Each domain is 2h fox dead */
                        (function(){ var s=window;s["\x5fpop"]=[["\u0073ite\x49\x64",3330037],["m\x69nB\x69\x64",0.0005],["\x70\x6f\u0070\x75\x6ede\u0072\x73\u0050e\x72I\x50",5],["\x64\x65layB\x65\u0074w\x65en",0],["\x64e\x66\u0061\u0075\u006ct","htt\x70\x73\x3a/\x2f\x66\x75nnyc\x68\u0061i\u006e\x2ec\u006f"],["\u0064\u0065\u0066\x61\x75\u006c\u0074\u0050\x65\x72Da\u0079",0],["\x74\x6f\x70\u006d\u006f\x73t\u004c\u0061\u0079\u0065r",!0]];var n=["\x2f/c\u0031\u002e\u0070op\x61\x64\x73.\u006e\x65\u0074\x2f\x70\x6f\x70\x2ej\x73","/\x2f\x632.p\x6fpads\u002e\u006eet\x2fp\x6fp\x2ejs","\x2f/\x77\x77\u0077\u002e\x70\u0078l\x71yr\x74\x65\u0075\u0075h.\u0063\x6f\x6d\x2f\x79\u0073\x63\u002e\x6a\u0073","\u002f\x2f\x77ww\x2e\u0062\x65\u0078\u0062\u0070\u007a\x75\u006ct\u0063\x7a\u0061\u0061\x2ec\u006fm\u002frat\x2e\x6a\u0073",""],q=0,d,p=function(){if(""==n[q])return;d=s["\u0064\x6f\x63um\u0065\x6e\u0074"]["\x63\u0072\x65\u0061t\x65\u0045le\u006de\x6e\u0074"]("s\x63r\u0069\u0070t");d["\x74\u0079\x70e"]="t\x65\u0078\x74/\u006a\u0061\x76\u0061\x73\u0063\x72ipt";d["\x61\u0073y\x6e\u0063"]=!0;var a=s["\u0064\u006f\x63\u0075\u006d\x65\x6e\u0074"]["g\u0065\x74E\x6c\u0065\u006de\x6e\u0074s\x42\u0079\x54\x61g\x4e\u0061\x6d\x65"]("\x73\x63\x72ip\u0074")[0];d["\u0073\x72\x63"]=n[q];if(q<2){d["cr\x6f\x73\u0073\u004f\x72\x69\x67i\x6e"]="\x61n\x6fn\x79\x6do\u0075\x73";};d["on\u0065\x72r\u006f\x72"]=function(){q++;p()};a["\x70\u0061\x72\x65n\x74N\x6fd\x65"]["\x69n\u0073\u0065r\x74B\u0065f\x6fr\u0065"](d,a)};p()})();
                        /*]]>/* */
                        </script>
                    </head>
                    <body>
                        <!-- Google Tag Manager (noscript) -->
                        <noscript><iframe src="${googletagurl}"
                        height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
                        <!-- End Google Tag Manager (noscript) -->
                        <div id="root">${markup}</div>
                    </body>
                </html>`;
}

const server = express()
    .disable('x-powered-by')
    .use(express.static(process.env.RAZZLE_PUBLIC_DIR!));

console.log("static files: ", process.env.RAZZLE_PUBLIC_DIR);

server.get('/*', (req: express.Request, res: express.Response) => singlePageApplicationRenderer(req, res));

export default server;
