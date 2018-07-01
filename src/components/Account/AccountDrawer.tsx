import {Component} from 'react';
import * as React from 'react'
import "./Account.css";
import SteemAccount from "./SteemAccount";
import Drawer from "@material-ui/core/Drawer/Drawer";
import {PROVIDER_FIREBASE_MAIL, PROVIDER_STEEM, USER_ENTRY_NO_VALUE} from "../../service/generic/UserEntry";
import {authService} from "../../service/generic/AuthService";
import FirebaseAccount from "./FirebaseAccount";

export default class AccountDrawer extends Component<{
    open:boolean,
    onRequestChange: (state:boolean) => void,
},{}> {

    state = {
        user: USER_ENTRY_NO_VALUE
    };

    private removeListener: () => void;

    componentWillMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            this.setState({
                user: user
            });
        });
    }

    componentWillUnmount() {
        this.removeListener();
    }

    render() {
        return (
            <Drawer open={this.props.open}
                    onClose={() => this.props.onRequestChange(false)}>
                {this.state.user.provider==PROVIDER_STEEM && <SteemAccount onLogout={() => this.props.onRequestChange(false)}/>}
                {this.state.user.provider==PROVIDER_FIREBASE_MAIL && <FirebaseAccount onLogout={() => this.props.onRequestChange(false)}/>}
            </Drawer>
        )
    }
}