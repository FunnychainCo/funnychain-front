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
import {ionicMobileAppService} from "../service/mobile/IonicMobileAppService";
import {userNotificationService} from "../service/notification/UserNotificationService";
import {deviceDetector} from "../service/mobile/DeviceDetector";
import {backService} from "../service/BackService";
import {report} from "../service/log/Report";
import {realTimeData} from "../service/database/RealTimeData";
import {isBrowserRenderMode} from "../service/ssr/windowHelper";
import {createMuiTheme} from "@material-ui/core";
import Helmet from 'react-helmet';
import register from "../registerServiceWorker";

// Create a theme instance.
const theme = createMuiTheme({
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

export function getTheme() {
    return theme;
}

class App extends React.Component<any, any> {
    state = {};

    componentWillMount() {
        if (isBrowserRenderMode()) {
            ionicMobileAppService.start();//must be started before userNotificationService because it need to know what device we use
            backService.start();
            register();
        }
        userNotificationService.start();//must be started before firebaseInitAuthService because it will register uid
        pwaService.start();
        authService.start();
        realTimeData.connect();
        ipfsFileUploadService.start();
        deviceDetector.start();
        report.start();

        audit.track("user/app/open", {
            target: deviceDetector.getDeviceString(),
            agent: deviceDetector.getUserAgent(),
            version: GLOBAL_PROPERTIES.VERSION()
        });
        console.log("running on: " + deviceDetector.getDeviceString());
    }

    render() {
        return (
            <React.Fragment>
                <Helmet>
                    <title>FunnyChain: A Funny chain of redistribution!</title>
                    {/* Meta description */}
                    <meta name="Description"
                          content="Funny Chain: Incentivized memes on the blockchain : Be Funny, Make Money !"/>
                    <meta name="Keywords" content="Meme Blockchain Funnychain Funny Chain Money"/>

                    {/* OG Meta description */}
                    <meta property="og:title" content="Be Funny, Make Money!"/>
                    <meta property="og:site_name" content="FunnyChain: A Funny chain of redistribution!"/>
                    <meta property="og:url" content="https://beta.funnychain.co"/>
                    <meta property="og:description"
                          content="Be Funny, Make Money! What's that? What if you could earn money by posting or even liking memes? Well it’s going to be possible now with FunnyChain."/>
                    <meta property="og:type" content="website"/>
                    <meta property="og:image"
                          content="https://ipfs.funnychain.co/ipfs/QmVA3ZSL6k2q7X9xJyT42gAuJj7sCs9aYnFnUpWsi8styf"/>

                    {/* Twitter Meta description */}
                    <meta name="twitter:card" content="summary_large_image"/>
                    <meta name="twitter:description"
                          content="Be Funny, Make Money! What's that? What if you could earn money by posting or even liking memes? Well it’s going to be possible now with FunnyChain.&nbsp;FunnyChain is going to create a new meme economy based on token incentives using the Blockchain technology. ✌✌♋♋"/>
                    <meta name="twitter:title"
                          content="Be Funny, Make Money! - FunnyChain is creating a new meme economy."/>
                    <meta name="twitter:site" content="@funnychain_lol"/>
                    <meta name="twitter:image"
                          content="https://ipfs.funnychain.co/ipfs/QmVA3ZSL6k2q7X9xJyT42gAuJj7sCs9aYnFnUpWsi8styf"/>
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
