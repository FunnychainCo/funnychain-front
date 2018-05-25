//import 'bootstrap/dist/css/bootstrap.css'
import * as React from 'react';
import {Route, BrowserRouter, Switch} from 'react-router-dom'

import "./App.css"

import Header from "../components/Header/Header";
import Home from "../containers/Home";
import Version from "../components/Version/Version";
import {userNotificationService} from "../service/UserNotificationService";
import {pwaService} from "../service/PWAService";
import {steemAuthService} from "../service/steem/SteemAuthService";
import Connect from "../components/Steem/Connect"
import {ipfsFileUploadService} from "../service/IPFSFileUploader/IPFSFileUploadService";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";

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
        steemAuthService.start();
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
        const theme = createMuiTheme();
        return (
            <BrowserRouter>
                <MuiThemeProvider theme={theme}>
                    <div className="fullSpace">
                        <Header/>
                        <div className="fullSpace">
                            <Switch className="fullSpace">
                                <Route className="fullSpace" path='/index.html' exact component={Home}/>
                                <Route className="fullSpace" path='/' exact component={Home}/>
                                <Route className="fullSpace" path='/steem/connect' component={Connect}/>
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
