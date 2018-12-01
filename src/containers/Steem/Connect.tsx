import *as React from 'react'
import {Component} from 'react'
//import {steemConnectAuthService} from "../../service/steem/SteemConnectAuthService";
import {Redirect} from "react-router-dom";
import {authService} from "../../service/generic/AuthService";

export default class Connect extends Component {

    state = {
      loading : true
    };

    componentDidMount(){
        console.log(window.location.href);
        //steemConnectAuthService.notifyConnexionURL(window.location.href);
        authService.login(authService.MODE_STEEM,window.location.href);
        this.setState({loading:false});
    }

    render () {
        return (
            this.state.loading?<div>loading</div>:<Redirect to='/'/>
        )
    }
}
