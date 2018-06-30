import {Component} from 'react'
import *as React from 'react'
//import {steemAuthService} from "../../service/steem/SteemAuthService";
import {Redirect} from "react-router-dom";
import {authService} from "../../service/generic/AuthService";

export default class Connect extends Component {

    state = {
      loading : true
    };

    componentDidMount(){
        console.log(window.location.href);
        //steemAuthService.notifyConnexionURL(window.location.href);
        authService.login(authService.MODE_STEEM,window.location.href);
        this.setState({loading:false});
    }

    render () {
        return (
            this.state.loading?<div>loading</div>:<Redirect to='/'/>
        )
    }
}
