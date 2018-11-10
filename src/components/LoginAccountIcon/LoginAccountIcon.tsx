import * as React from 'react';
import {authService} from "../../service/generic/AuthService";
import {Component} from "react";
import {USER_ENTRY_NO_VALUE, UserEntry} from "../../service/generic/UserEntry";
import Logged from "./Logged";
import NotLogged from "./NotLogged";
import {withRouter} from 'react-router-dom'
import AccountDrawer from "../Account/AccountDrawer";
import LoginRegisterDialogV2 from "../LoginDialog/LoginRegisterDialogV2";
import { Link } from 'react-router-dom';
import {backService} from "../../service/BackService";

interface State {
    user: UserEntry,
    dialogLogin: boolean,
    drawerOpen: boolean,
}

class LoginAccountIcon extends Component<{history:any}, State> {
    state: State = {
        user: USER_ENTRY_NO_VALUE,
        dialogLogin: false,
        drawerOpen: false,
    };
    private removeListener: () => void = ()=>{};
    private removeBackListener: () => void = ()=>{};

    componentDidMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            this.setState({user: user});
        })

        this.removeBackListener = backService.onBack(() => {
            this.setState({drawerOpen:false});
            this.setState({dialogLogin:false});
        })
    }

    componentWillUnmount() {
        this.removeListener();
        this.removeBackListener();
    }

    openDialogLogin = () => {
        this.setState({dialogLogin: true});
    };

    render() {

        const AccountLink = (props) => <Link to={"/account"} {...props} />;
        const LogLink = (props) => <Link to={"/log"} {...props} />;
        const LoggedButton =
            <Logged
                component={AccountLink}
                onAccountClick={() => {
                this.setState({drawerOpen:true});
            }}/>;
       const NotLoggedButton =
                <NotLogged
                    component={LogLink}
                    onDialogLogin={() => {
                    this.setState({dialogLogin:true});
                }}/>;
        return (
            <div>
                {(this.state.user !== USER_ENTRY_NO_VALUE ? true : false) ?
                    LoggedButton : NotLoggedButton}
                <AccountDrawer open={this.state.drawerOpen} onRequestChange={()=>{backService.goBack()}}/>
                <LoginRegisterDialogV2 open={this.state.dialogLogin} onRequestClose={()=>{backService.goBack()}}/>
            </div>)
    }
}

export default withRouter(LoginAccountIcon);