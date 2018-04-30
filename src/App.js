import 'bootstrap/dist/css/bootstrap.css'
import React, {Component} from "react";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import Header from "./components/Header/Header";
import LeftNav from "./components/LeftNav/LeftNav";
import {Route, BrowserRouter, Switch} from 'react-router-dom'
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Home from "./containers/Home";
import {PublicRoute} from "./service/AuthService.js"
import {firebaseAuthService} from "./service/FirebaseAuthService";
import Version from "./components/Version/Version";
import {PrivateRoute} from "./service/AuthService";
import Account from "./containers/Account";
import "./App.css"

class App extends Component {
    state = {
        authed: false,
        loading: true,
    }
    removeListener=null;
    componentDidMount () {
        this.removeListener = firebaseAuthService.firebaseAuth().onAuthStateChanged((user) => {
            if (user) {
                this.setState({
                    authed: true,
                    loading: false,
                })
            } else {
                this.setState({
                    authed: false,
                    loading: false
                })
            }
        })
    }
    componentWillUnmount () {
        this.removeListener();
    }
    render() {
        return (
            <BrowserRouter>
                <MuiThemeProvider>
                    <div className="fullSpace">
                        <Header/>
                        <div className="fullSpace">
                            <LeftNav/>
                            <Switch className="fullSpace">
                                <Route className="fullSpace" path='/' exact component={Home} />
                                <PrivateRoute authed={this.state.authed} path='/account' component={Account} />
                                <PublicRoute authed={this.state.authed} path='/login' component={Login} />
                                <PublicRoute authed={this.state.authed} path='/register' component={Register} />
                                <Route render={() => <h3>No Match</h3>} />
                            </Switch>
                        </div>
                        <Version/>
                    </div>
                </MuiThemeProvider>
            </BrowserRouter>
        );
    }

}

export default App;
