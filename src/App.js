import 'bootstrap/dist/css/bootstrap.css'
import React, {Component} from "react";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import Header from "./components/Header/Header";
import {Route, BrowserRouter, Switch} from 'react-router-dom'
import Home from "./containers/Home";
import {firebaseAuthService} from "./service/FirebaseAuthService";
import Version from "./components/Version/Version";
import "./App.css"
import {Snackbar} from "material-ui";
import {userNotificationService} from "./service/UserNotificationService";
import {createMuiTheme} from "material-ui";
import {pwaService} from "./service/PWAService";

class App extends Component {
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
        })
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

export default App;
