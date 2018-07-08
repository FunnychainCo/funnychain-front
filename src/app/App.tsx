import * as React from 'react';
import {BrowserRouter, Switch} from 'react-router-dom'

import "./App.css"

import Version from "../components/Version/Version";
import {userNotificationService} from "../service/UserNotificationService";
import {pwaService} from "../service/mobile/PWAService";
import {ipfsFileUploadService} from "../service/IPFSFileUploader/IPFSFileUploadService";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import {authService} from "../service/generic/AuthService";
import HomePage from "../containers/HomePage";

class App extends React.Component<any,any> {
    state = {};

    componentDidMount() {
        pwaService.start();
        authService.start();
        ipfsFileUploadService.start();
        userNotificationService.registerCallBack((message) => {console.log(message);});
    }

    render() {
        const theme = createMuiTheme({
            palette: {
                //type: 'dark'
                //https://material.io/tools/color/#!/?view.left=0&view.right=0&primary.color=212121&secondary.color=FF3D00
                primary: {
                    light: '#484848',
                    main: '#212121',
                    dark:  '#000000',
                },
                secondary: {
                    light: '#FF7539',
                    main: '#FF3D00',
                    dark:  '#C30000',
                },
            },
        });
        return (
            <BrowserRouter>
                <MuiThemeProvider theme={theme}>
                    <div className="fullSpace">
                        <Switch className="fullSpace">
                            <HomePage />
                        </Switch>
                        <Version/>
                    </div>
                </MuiThemeProvider>
            </BrowserRouter>
        );
    }
}

export default App;
