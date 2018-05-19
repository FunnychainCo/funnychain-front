import React, {Component} from 'react';
import {Avatar} from "material-ui";
import {authService} from "../../service/generic/AuthService";

export default class Logged extends Component {
    state={
        user:null
    }
    componentDidMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            this.setState({user: user});
        })
    }

    componentWillUnmount() {
        this.removeListener();
    }

    render() {
        return <div>{(this.state.user!==null) && <Avatar onClick={this.props.onAccountClick} src={this.state.user.avatar.url}/>}
        </div>
    }
}