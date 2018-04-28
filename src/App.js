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
                    <div>
                    <Header/>
                    <div style={{display: 'flex'}}>
                        <LeftNav/>
                        <Switch>
                            <Route path='/' exact component={Home} />
                            <PublicRoute authed={this.state.authed} path='/login' component={Login} />
                            <PublicRoute authed={this.state.authed} path='/register' component={Register} />
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
