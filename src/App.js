import 'bootstrap/dist/css/bootstrap.css'
import React, {Component} from "react";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import Header from "./components/Header/Header";
import {Route, BrowserRouter, Switch} from 'react-router-dom'
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Home from "./containers/Home";
import {firebaseAuthService} from "./service/FirebaseAuthService";
import Version from "./components/Version/Version";
import Account from "./components/Account/Account";
import "./App.css"
import {Snackbar} from "material-ui";
import {userNotificationService} from "./service/UserNotificationService";
import {createMuiTheme} from "material-ui";

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
                                <Route className="fullSpace" path='/' exact component={Home}/>
                                <Route className="fullSpace" path='/account' exact component={Account}/>
                                <Route className="fullSpace" path='/login' exact component={Login}/>
                                <Route className="fullSpace" path='/register' exact component={Register}/>
                                <Route render={() => <h3>No Match</h3>}/>
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
