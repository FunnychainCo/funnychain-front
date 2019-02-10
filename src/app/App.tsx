import * as React from 'react';
import {BrowserRouter} from 'react-router-dom'

import "./App.css"

import Version from "../components/Version/Version";
import {pwaService} from "../service/mobile/PWAService";
import {ipfsFileUploadService} from "../service/IPFSFileUploader/IPFSFileUploadService";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import {authService} from "../service/generic/AuthService";
import HomePage from "../containers/HomePage";
import GlobalNotification from "../components/GlobalNotification/GlobalNotification";
import {firebaseInitAuthService} from "../service/firebase/FirebaseInitAuthService";
import {audit} from "../service/Audit";
import {GLOBAL_PROPERTIES} from "../properties/properties";
import {ionicMobileAppService} from "../service/mobile/IonicMobileAppService";
import {userNotificationService} from "../service/notification/UserNotificationService";
import {deviceDetector} from "../service/mobile/DeviceDetector";


class App extends React.Component<any, any> {
    state = {};

    componentWillMount() {
        ionicMobileAppService.start();//must be started before userNotificationService because it need to know what device we use
        userNotificationService.start();//must be started before firebaseInitAuthService because it will register uid
        firebaseInitAuthService.start();
        pwaService.start();
        authService.start();
        ipfsFileUploadService.start();
        audit.track("user/app/open",{
            target:deviceDetector.getDeviceString(),
            agent:window.navigator.userAgent,
            version:GLOBAL_PROPERTIES.VERSION
        });
        console.log("running on: "+deviceDetector.getDeviceString());
    }

    render() {
        const theme = createMuiTheme({
            typography: {
                useNextVariants: true,
            },
            palette: {
                //type: 'dark'
                //https://material.io/tools/color/#!/?view.left=0&view.right=0&primary.color=212121&secondary.color=FF3D00
                primary: {
                    light: '#484848',
                    main: '#212121',
                    dark: '#000000',
                },
                secondary: {
                    light: '#FF7539',
                    main: '#FF3D00',
                    dark: '#C30000',
                },
            },
        });
        return (
            <BrowserRouter>
                <MuiThemeProvider theme={theme}>
                    <HomePage/>
                    <Version/>
                    <GlobalNotification/>
                </MuiThemeProvider>
            </BrowserRouter>
        );
    }
}

export default App;
