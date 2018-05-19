import 'bootstrap/dist/css/bootstrap.css'
import React, {Component} from "react";
import {Route, BrowserRouter, Switch} from 'react-router-dom'
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import {Snackbar} from "material-ui";
import {createMuiTheme} from "material-ui";

import "./App.css"

import Header from "../components/Header/Header";
import Home from "../containers/Home";
import {firebaseAuthService} from "../service/firebase/FirebaseAuthService";
import Version from "../components/Version/Version";
import {userNotificationService} from "../service/UserNotificationService";
import {pwaService} from "../service/PWAService";
import {steemAuthService} from "../service/steem/SteemAuthService";
import Connect from "../components/Steem/Connect"


class AppJs extends Component {
    state = {
        authed: false,
        loading: true,
        userMessage: {
            display: false,
            message: ""
        }
    }
    removeListener = null;

    componentDidMount() {
        pwaService.start();
        steemAuthService.start();
        this.removeListener = firebaseAuthService.firebaseAuth().onAuthStateChanged((user) => {
            this.setState({
                authed: user ? true : false,
                loading: false,
            });
        });
        userNotificationService.registerCallBack((message) => {
            this.setState({
                userMessage: {
                    display: true,
                    message: message
                }
            })
        });
    }

    componentWillUnmount() {
        this.removeListener();
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
                        <Snackbar
                            open={this.state.userMessage.display}
                            message={this.state.userMessage.message}
                            autoHideDuration={4000}
                            onRequestClose={this.handleRequestClose}
                        />
                    </div>
                </MuiThemeProvider>
            </BrowserRouter>
        );
    }

}

export default AppJs;
