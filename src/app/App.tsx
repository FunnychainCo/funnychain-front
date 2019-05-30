import * as React from 'react';
import {Switch} from 'react-router-dom'

import Version from "../components/Version/Version";
import {pwaService} from "../service/mobile/PWAService";
import {ipfsFileUploadService} from "../service/uploader/IPFSFileUploadService";
import {authService} from "../service/generic/AuthService";
import HomePage from "../containers/HomePage";
import GlobalNotification from "../components/GlobalNotification/GlobalNotification";
import {audit} from "../service/log/Audit";
import {GLOBAL_PROPERTIES} from "../properties/properties";
import {userNotificationService} from "../service/notification/UserNotificationService";
import {deviceDetector} from "../service/mobile/DeviceDetector";
import {report} from "../service/log/Report";
import {realTimeData} from "../service/database/RealTimeData";
import {createMuiTheme, CssBaseline} from "@material-ui/core";
import Helmet from 'react-helmet';
import {generateMemeComponentCache} from "../components/Meme/MemeComponent";
import {USER_ENTRY_NO_VALUE} from "../service/generic/UserEntry";

export function getTheme() {
    return createMuiTheme({
        typography: {
            useNextVariants: true,
        },
        palette: {
            //type: 'dark'
            //https://material.io/tools/color/#!/?view.left=0&view.right=0&primary.color=212121&secondary.color=FF3D00
            primary: {
                light: '#ffc046',
                main: '#ff8f00',
                dark: '#c56000',
            },
            secondary: {
                light: '#7843ff',
                main: '#1e00ff',
                dark: '#0000ca',
            },
        },
    });
}

export function precacheData(url:string):Promise<any>{
    let dataPromise:Promise<any>[] = [];
    dataPromise.push(Promise.resolve({}));
    /*if (url.startsWith("/")) {
        dataPromise.push(generateCacheMemeSwipe());
    }*/

    if (url.startsWith("/meme/")) {
        dataPromise.push(generateMemeComponentCache(url));
    }
    return Promise.all(dataPromise);
}

class App extends React.Component<any, any> {
    state = {};

    componentWillMount() {
        userNotificationService.start();//must be started before firebaseInitAuthService because it will register uid
        pwaService.start();
        authService.start();
        realTimeData.connect();
        ipfsFileUploadService.start();
        report.start();

        let onAuthStateChangedRemoveListener = authService.onAuthStateChanged(userData => {
            if(userData!==USER_ENTRY_NO_VALUE){
                onAuthStateChangedRemoveListener();
                audit.track("user/app/open/logged", {
                    target: deviceDetector.getDeviceString(),
                    agent: deviceDetector.getUserAgent(),
                    version: GLOBAL_PROPERTIES.VERSION()
                });
            }
        });

        audit.track("user/app/open", {
            target: deviceDetector.getDeviceString(),
            agent: deviceDetector.getUserAgent(),
            version: GLOBAL_PROPERTIES.VERSION()
        });
        console.log("running on: " + deviceDetector.getDeviceString());
    }

    render() {
        const title = "FunnyChain: A Funny chain of redistribution!";
        const description = "Be Funny, Make Money! What's that? What if you could earn money by posting or even liking memes? Well it’s going to be possible now with FunnyChain."
        const image = "https://ipfs.funnychain.co/ipfs/QmVA3ZSL6k2q7X9xJyT42gAuJj7sCs9aYnFnUpWsi8styf";
        return (
            <React.Fragment>
                <CssBaseline />
                <Helmet>
                    <title>FunnyChain: A Funny chain of redistribution!</title>
                    {/* Meta description */}
                    <meta name="Description" content={description}/>
                    <meta name="Keywords" content="Meme Blockchain Funnychain Funny Chain Money"/>

                    {/* OG Meta description */}
                    <meta property="og:title" content={title}/>
                    <meta property="og:site_name" content={title}/>
                    <meta property="og:url" content={GLOBAL_PROPERTIES.FUNNYCHAIN_HOST()}/>
                    <meta property="og:description" content={description}/>
                    <meta property="og:type" content="website"/>
                    <meta property="og:image" content={image}/>

                    {/* Twitter Meta description */}
                    <meta name="twitter:card" content="summary_large_image"/>
                    <meta name="twitter:description" content={description}/>
                    <meta name="twitter:title" content={title}/>
                    <meta name="twitter:site" content="@funnychain_lol"/>
                    <meta name="twitter:image" content={image}/>
                    <meta name="twitter:creator" content="@funnychain_lol"/>

                </Helmet>
                <Switch>
                    <HomePage/>
                </Switch>
                <Version/>
                <GlobalNotification/>
            </React.Fragment>
        );
    }
}

export default App;
