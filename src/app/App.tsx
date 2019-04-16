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
import registerServiceWorker from "../registerServiceWorker";


class App extends React.Component<any, any> {
    state = {};

    componentWillMount() {
        if (isBrowserRenderMode()) {
            ionicMobileAppService.start();//must be started before userNotificationService because it need to know what device we use
            backService.start();
            registerServiceWorker();
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
            <Switch>
                <HomePage/>
                <Version/>
                <GlobalNotification/>
            </Switch>
        );
    }
}

export default App;
