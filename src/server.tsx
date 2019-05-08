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
