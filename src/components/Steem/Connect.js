import React, {Component} from 'react'
import {sc2AuthService} from "../../service/SC2AuthService";
import {Redirect} from "react-router-dom";

export default class Connect extends Component {

    state = {
      loading : true
    };

    componentDidMount(){
        console.log(window.location.href);
        sc2AuthService.notifyConnexionURL(window.location.href);
        this.setState({loading:false});
    }

    render () {
        return (
            this.state.loading?<div>loading</div>:<Redirect to='/'/>
        )
    }
}
