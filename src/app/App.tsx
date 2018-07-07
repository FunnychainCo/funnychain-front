//import 'bootstrap/dist/css/bootstrap.css'
import * as React from 'react';
import {Route, BrowserRouter, Switch} from 'react-router-dom'

import "./App.css"

import Version from "../components/Version/Version";
import {userNotificationService} from "../service/UserNotificationService";
import {pwaService} from "../service/mobile/PWAService";
import Connect from "../components/Steem/Connect"
import {ipfsFileUploadService} from "../service/IPFSFileUploader/IPFSFileUploadService";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import {authService} from "../service/generic/AuthService";
import Home from "../containers/Home";
import Debug from "../containers/Debug";

class App extends React.Component<any,{
    userMessage: {
        display: boolean,
        message: string
    }
}> {
    state = {
        userMessage: {
            display: false,
            message: ""
        }
    };

    componentDidMount() {
        pwaService.start();
        authService.start();
        ipfsFileUploadService.start();
        userNotificationService.registerCallBack((message) => {
            this.setState({
                userMessage: {
                    display: true,
                    message: message
                }
            })
        });
    }

    handleRequestClose = () => {
        this.setState({
            userMessage: {
                display: false,
                message: ""
            }
        })
    };

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
                        <div className="fullSpace">
                            <Switch className="fullSpace">
                                <Route className="fullSpace" path='/steem/connect' component={Connect}/>
                                <Route className="fullSpace" exact path='/debug' component={Debug}/>
                                <Route className="fullSpace" path='/' component={Home}/>
                                <Route className="fullSpace" component={Home}/>
                            </Switch>
                        </div>
                        <Version/>
                        {/**<Snackbar
                            open={this.state.userMessage.display}
                            message={this.state.userMessage.message}
                            autoHideDuration={4000}
                            onRequestClose={this.handleRequestClose}
                        />**/}
                    </div>
                </MuiThemeProvider>
            </BrowserRouter>
        );
    }
}

export default App;
