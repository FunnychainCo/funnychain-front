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

class Main extends React.Component {
    // Remove the server-side injected CSS.
    componentWillMount(): void {
        deviceDetector.start(window.navigator.userAgent);
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