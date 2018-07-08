import * as React from 'react';
import {authService} from "../../service/generic/AuthService";
import {Component} from "react";
import {USER_ENTRY_NO_VALUE, UserEntry} from "../../service/generic/UserEntry";
import Logged from "./Logged";
import NotLogged from "./NotLogged";
import {withRouter} from 'react-router-dom'

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
        const LoggedButton =
            <Logged onAccountClick={() => {
                this.props.history.push(window.location.pathname + "/account");
            }}/>;
       const NotLoggedButton =
                <NotLogged onDialogLogin={() => {
                    this.props.history.push(window.location.pathname + "/login");
                }}/>;
        return (
            <div>
                {(this.state.user !== USER_ENTRY_NO_VALUE ? true : false) ?
                    LoggedButton : NotLoggedButton}
            </div>)
    }
}

export default withRouter(LoginAccountIcon);