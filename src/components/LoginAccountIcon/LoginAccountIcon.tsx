import * as React from 'react';
import {authService} from "../../service/generic/AuthService";
import {Component} from "react";
import {USER_ENTRY_NO_VALUE, UserEntry} from "../../service/generic/UserEntry";
import Logged from "./Logged";
import NotLogged from "./NotLogged";
import LoginRegisterDialog from "../LoginDialog/LoginRegisterDialog";
import UserPasswordRegisterDialog from "../LoginDialog/UserPasswordRegisterDialog";
import AccountDrawer from "../Account/AccountDrawer";

export default class LoginAccountIcon extends Component<any,
    {
        user: UserEntry,
        dialogLogin: boolean,
        dialogRegister: boolean,
        drawerOpen: boolean,
    }> {
    state = {
        user: USER_ENTRY_NO_VALUE,
        dialogLogin: false,
        dialogRegister: false,
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

    openDialogRegister = () => {
        this.setState({dialogRegister: true});
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
                    onDialogRegister={this.openDialogRegister}
                />}
            <LoginRegisterDialog open={this.state.dialogLogin}
                                 onRequestClose={() => this.setState({dialogLogin: false})}/>
            <UserPasswordRegisterDialog open={this.state.dialogRegister}
                                        onRequestClose={() => this.setState({dialogRegister: false})}/>
            <AccountDrawer open={this.state.drawerOpen}
                           onRequestChange={(open) => {
                               this.setState({drawerOpen: open})
                           }}/>
        </div>)
    }
}