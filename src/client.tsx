import React from 'react';
import ReactDOM from 'react-dom';
import JssProvider from 'react-jss/lib/JssProvider';
import {
    MuiThemeProvider,
    createGenerateClassName,
} from '@material-ui/core/styles';
import App, {getTheme, precacheData} from './app/App';
import {BrowserRouter} from "react-router-dom";
import {deviceDetector} from "./service/mobile/DeviceDetector";
import {cookiesService} from "./service/ssr/CookiesService";
import {ionicMobileAppService} from "./service/mobile/IonicMobileAppService";
import {backService} from "./service/BackService";
import register from "./registerServiceWorker";

class Main extends React.Component {
    // Remove the server-side injected CSS.
    componentWillMount(): void {
        backService.start();
        register();//service worker
        deviceDetector.start(window.navigator.userAgent);
        ionicMobileAppService.start();//must be started before userNotificationService because it need to know what device we use
        cookiesService.start("");
    }

    componentDidMount() {
        const jssStyles = document.getElementById('jss-server-side');
        if (jssStyles && jssStyles.parentNode) {
            jssStyles.parentNode.removeChild(jssStyles);
        }
    }

    render() {
        return <App/>
    }
}

// Create a new class name generator.
const generateClassName = createGenerateClassName();

let dataPromise = precacheData(window.location.pathname);
dataPromise.then(() => {
    ReactDOM.hydrate(
        <JssProvider generateClassName={generateClassName}>
            <MuiThemeProvider theme={getTheme()}>
                <BrowserRouter>
                    <Main/>
                </BrowserRouter>
            </MuiThemeProvider>
        </JssProvider>,
        document.querySelector('#root'),
    );
});

if (module.hot) {
    module.hot.accept();
}