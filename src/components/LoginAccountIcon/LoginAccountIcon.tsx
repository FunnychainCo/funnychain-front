import * as React from 'react';
import {authService} from "../../service/generic/AuthService";
import {Component} from "react";
import {USER_ENTRY_NO_VALUE, UserEntry} from "../../service/generic/UserEntry";
import Logged from "./Logged";
import NotLogged from "./NotLogged";
import LoginRegisterDialog from "../LoginDialog/LoginRegisterDialog";
import AccountDrawer from "../Account/AccountDrawer";

interface State {
    user: UserEntry,
    dialogLogin: boolean,
    drawerOpen: boolean,
}

export default class LoginAccountIcon extends Component<{},State> {
    state:State = {
        user: USER_ENTRY_NO_VALUE,
        dialogLogin: false,
        drawerOpen: false,
    };
    private removeListener: () => void;

    componentDidMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            this.setState({user: user});
        })
    }

    componentWillUnmount() {
        this.removeListener();
    }

    openDialogLogin = () => {
        this.setState({dialogLogin: true});
    };

    render() {
        return(
        <div>
            {(this.state.user !== USER_ENTRY_NO_VALUE ? true : false) ?
                <Logged onAccountClick={() => {
                    this.setState({drawerOpen: true})
                }}/> :
                <NotLogged
                    onDialogLogin={this.openDialogLogin}
                />}
            <LoginRegisterDialog open={this.state.dialogLogin}
                                 onRequestClose={() => this.setState({dialogLogin: false})}/>
            <AccountDrawer open={this.state.drawerOpen}
                           onRequestChange={(open) => {
                               this.setState({drawerOpen: open})
                           }}/>
        </div>)
    }
}