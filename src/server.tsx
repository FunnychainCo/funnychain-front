import express from 'express';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';

import App, {getTheme} from './app/App';
import {setProperties} from "./properties/properties";

import {SheetsRegistry} from 'jss';
import JssProvider from 'react-jss/lib/JssProvider';
import {
    MuiThemeProvider,
    createGenerateClassName,
} from '@material-ui/core/styles';

let assets: any;

const syncLoadAssets = () => {
    assets = require(process.env.RAZZLE_ASSETS_MANIFEST!);
};
syncLoadAssets();

let PROPERTIES = {
    /* funnychain */
    HOST: process.env.HOST?process.env.HOST:"https://alpha.funnychain.co/backend",
    HOST_API: process.env.HOST_API?process.env.HOST_API:"https://alpha.funnychain.co/backend",

    /* one-signal api-key */
    ONE_SIGNAL_API_KEY: process.env.ONE_SIGNAL_API_KEY?process.env.ONE_SIGNAL_API_KEY:"dc7c1d29-5ea3-4967-baac-a64f0be10c95",
    ONE_SIGNAL_ANDROID_NUMBER: process.env.ONE_SIGNAL_ANDROID_NUMBER?process.env.ONE_SIGNAL_ANDROID_NUMBER:"818676897965",

    /* google analytics id */
    GOOGLE_ANALYTICS_ACTIVATED: process.env.GOOGLE_ANALYTICS_ACTIVATED?process.env.GOOGLE_ANALYTICS_ACTIVATED:'false',
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID?process.env.GOOGLE_ANALYTICS_ID:'UA-115386396-2',
    GOOGLE_ANALYTICS_URL: process.env.GOOGLE_ANALYTICS_URL?process.env.GOOGLE_ANALYTICS_URL:"https://www.googletagmanager.com/gtag/js?id=UA-115386396-2",

    /* firebase api */
    FIREBASE_APIKEY: process.env.FIREBASE_APIKEY?process.env.FIREBASE_APIKEY:"AIzaSyAJC1BLZBe64zPsZHBIVBzGmPvH4FPSunY",
    FIREBASE_AUTH: process.env.FIREBASE_AUTH?process.env.FIREBASE_AUTH:"funnychain-dev.firebaseapp.com",
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL?process.env.FIREBASE_DATABASE_URL:"https://funnychain-dev.firebaseio.com",
    FIREBASE_MESSAGING_ID: process.env.FIREBASE_MESSAGING_ID?process.env.FIREBASE_MESSAGING_ID:"818676897965",
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID?process.env.FIREBASE_PROJECT_ID:"funnychain-dev",
    FIRABSE_STORAGE_BUCKET: process.env.FIRABSE_STORAGE_BUCKET?process.env.FIRABSE_STORAGE_BUCKET:"funnychain-dev.appspot.com"
};

console.log("using properties:",PROPERTIES);
setProperties(PROPERTIES);

// Create a sheetsRegistry instance.
const sheetsRegistry = new SheetsRegistry();

// Create a sheetsManager instance.
const sheetsManager = new Map();

// Create a new class name generator.
const generateClassName = createGenerateClassName();

function singlePageApplicationRenderer(req: express.Request, res: express.Response) {
    const context = {};
    const markup = renderToString(
        <JssProvider registry={sheetsRegistry} generateClassName={generateClassName}>
            <MuiThemeProvider theme={getTheme()} sheetsManager={sheetsManager}>
                <StaticRouter context={context} location={req.url}>
                    <App/>
                </StaticRouter>
            </MuiThemeProvider>
        </JssProvider>
    );
    // Grab the CSS from our sheetsRegistry.
    const css = sheetsRegistry.toString();
    res.send(
        `<!DOCTYPE html>
                <html lang="en">
                    <head>
                        <!-- start PWA script -->
                        <script type="text/javascript">
                            if(typeof(window) !== 'undefined') {
                                console.log("render start on browser");
                            }else{
                                console.log("render start on server (creating stub window)");
                            }
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
                                            
                        <!-- Global site tag (gtag.js) - Google Analytics -->
                        <script type="text/javascript">
                            //<![CDATA[
                            if (GLOBAL_PROPERTIES_JS.GOOGLE_ANALYTICS_ACTIVATED === 'true') {
                                document.write('\x3Cscript async src="' + GLOBAL_PROPERTIES_JS.GOOGLE_ANALYTICS_URL + '">\x3C/scr'+'ipt>');
                                window.dataLayer = window.dataLayer || [];
                        
                                function gtag() {
                                    dataLayer.push(arguments);
                                }
                        
                                gtag('js', new Date());
                                gtag('config', GLOBAL_PROPERTIES_JS.GOOGLE_ANALYTICS_ID);
                            }
                            //]]>
                        </script>
                        <!-- end Google Analytics -->
                        
                        <!-- Google Tag Manager -->
                        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                        })(window,document,'script','dataLayer','GTM-KPTK763');</script>
                        <!-- End Google Tag Manager -->
                        
                        <base href="/">
                        
                        <!-- ionic mobil compliance meta tags -->
                        <meta name="viewport"
                              content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
                        <meta name="format-detection" content="telephone=no"/>
                        <meta name="msapplication-tap-highlight" content="no"/>
                        <meta name="apple-mobile-web-app-capable" content="yes"/><!-- add to homescreen for ios -->
                        <meta name="apple-mobile-web-app-status-bar-style" content="black"/><!-- add to homescreen for ios -->
                        
                        <!-- Start Meta -->
                        <meta charset="utf-8">
                        <meta name="theme-color" content="#000000">
                        
                        <!-- Meta description -->
                        <meta name="Description" content="Funny Chain: Incentivized memes on the blockchain : Be Funny, Make Money !">
                        <meta name="Keywords" content="Meme Blockchain Funnychain Funny Chain Money">
                        
                        <!-- OG Meta description -->
                        <meta property="og:title" content="Be Funny, Make Money!">
                        <meta property="og:site_name" content="FunnyChain: A Funny chain of redistribution!">
                        <meta property="og:url" content="https://beta.funnychain.co">
                        <meta property="og:description"
                              content="Be Funny, Make Money! What's that? What if you could earn money by posting or even liking memes? Well it’s going to be possible now with FunnyChain.">
                        <meta property="og:type" content="website">
                        <meta property="og:image" content="https://ipfs.funnychain.co/ipfs/QmVA3ZSL6k2q7X9xJyT42gAuJj7sCs9aYnFnUpWsi8styf">
                        
                        <!-- Twitter Meta description -->
                        <meta name="twitter:card" content="summary_large_image">
                        <meta name="twitter:description"
                              content="Be Funny, Make Money! What's that? What if you could earn money by posting or even liking memes? Well it’s going to be possible now with FunnyChain.&nbsp;FunnyChain is going to create a new meme economy based on token incentives using the Blockchain technology. ✌✌♋♋">
                        <meta name="twitter:title" content="Be Funny, Make Money! - FunnyChain is creating a new meme economy.">
                        <meta name="twitter:site" content="@funnychain_lol">
                        <meta name="twitter:image" content="https://ipfs.funnychain.co/ipfs/QmVA3ZSL6k2q7X9xJyT42gAuJj7sCs9aYnFnUpWsi8styf">
                        <meta name="twitter:creator" content="@funnychain_lol">
                        
                        <!--
                          manifest.json provides metadata used when your web app is added to the
                          homescreen on Android. See https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/
                        -->
                        <link rel="manifest" href="/manifest.json">
                        <link rel="shortcut icon" href="/favicon.ico">
                        <!--
                          Notice the use of  in the tags above.
                          It will be replaced with the URL of the \`public\` folder during the build.
                          Only files inside the \`public\` folder can be referenced from the HTML.
                        
                          Unlike "/favicon.ico" or "favicon.ico", "/favicon.ico" will
                          work correctly both with client-side routing and a non-root public URL.
                          Learn how to configure a non-root public URL by running \`npm run build\`.
                          
                        -->
                        <!-- favicon stuff https://realfavicongenerator.net -->
                        <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon.png">
                        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
                        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
                        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">
                        <meta name="msapplication-TileColor" content="#00aba9">
                        <meta name="theme-color" content="#ffffff">
                        <title>FunnyChain: A Funny chain of redistribution!</title>
                        ${assets.client.css ? `<link rel="stylesheet" href="${assets.client.css}">` : ''}
                        <style id="jss-server-side">${css}</style>
                        ${process.env.NODE_ENV === 'production' ?
                        `<script src="${assets.client.js}" defer></script>` :
                        `<script src="${assets.client.js}" defer crossorigin></script>`
                        }
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
                        <div id="root">${markup}</div>
                    </body>
                </html>`
    );
}

const server = express()
    .disable('x-powered-by')
    .use(express.static(process.env.RAZZLE_PUBLIC_DIR!));

console.log("static files: ",process.env.RAZZLE_PUBLIC_DIR);

server.get('/*', (req: express.Request, res: express.Response) => singlePageApplicationRenderer(req, res));

export default server;
