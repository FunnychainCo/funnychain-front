import 'bootstrap/dist/css/bootstrap.css'
import React, {Component} from "react";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import Header from "./components/Header/Header";
import LeftNav from "./components/LeftNav";
import Grid from "./components/Grid/Grid";
import {firebaseAuth} from "./config/constants";
import {Route, BrowserRouter, Link, Redirect, Switch} from 'react-router-dom'
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import {PublicRoute,PrivateRoute} from "./helpers/auth.js"

class App extends Component {
    state = {
        authed: false,
        loading: true,
    }
    componentDidMount () {
        this.removeListener = firebaseAuth().onAuthStateChanged((user) => {
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
        this.removeListener()
    }
    render() {
        return (
            <BrowserRouter>
                <MuiThemeProvider>
                    <div>
                    <Header/>
                    <div style={{display: 'flex'}}>
                        <LeftNav/>
                        <Switch>
                            <Route path='/' exact component={Dashboard} />
                            <PublicRoute authed={this.state.authed} path='/login' component={Login} />
                            <PublicRoute authed={this.state.authed} path='/register' component={Register} />
                            <PublicRoute authed={this.state.authed} path='/home' component={Dashboard} />
                            <Route render={() => <h3>No Match</h3>} />
                        </Switch>
                    </div>
                    </div>
                </MuiThemeProvider>
            </BrowserRouter>
        );
    }

}

export default App;
