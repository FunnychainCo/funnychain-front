import {Component} from 'react'
import * as React from 'react'
import {authService, USER_ENTRY_NO_VALUE, UserEntry} from "../../service/generic/AuthService";
import ModeEdit from '@material-ui/icons/ModeEdit';
import VpnKey from '@material-ui/icons/VpnKey';

import "./Account.css";
import {pwaService} from "../../service/PWAService";
import Avatar from "@material-ui/core/Avatar/Avatar";
import Button from "@material-ui/core/Button/Button";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";

export default class Account extends Component<{
    onLogout: () => void
},{
    user: UserEntry,
    loading: boolean,
    displayAddToHomeButton: boolean,
}> {
    state = {
        user: {
            uid:"",
            displayName:"",
            avatarUrl:""
        },
        loading: true,
        displayAddToHomeButton: false,
    };

    private removeListener: () => void;
    private removeListenerPWA: any;
    private openSteemAccount = () => {
        window.location.href = "https://steemit.com/@"+this.state.user.uid;
    };

    componentWillMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            if (user==USER_ENTRY_NO_VALUE) {
                this.setState({
                    loading: true
                });
            } else {
                console.log(user);
                this.setState({
                    user: user,
                    loading: false
                });
            }
        });

        this.removeListenerPWA = pwaService.on((callback) => {
            this.setState({displayAddToHomeButton: callback == null ? false : true});
        });
    }

    componentWillUnmount() {
        this.removeListener();
        this.removeListenerPWA();
    }

    render() {
        return (
            <div className="fcCenteredContainer">
                {!this.state.loading && <div className="accountPaper accountPaperWidth fcContent">
                    <div className="fcCenteredContainer">
                        <Avatar
                            className="fcContent fcAvatarContent"
                            src={this.state.user.avatarUrl}
                        />
                    </div>
                    <div className="fcLeftAlignContainer">
                        <div className="fcContent">
                            <Button onClick={this.openSteemAccount}
                            ><ModeEdit/>&nbsp;&nbsp;{this.state.user.displayName}</Button><br/>
                            <Button onClick={() => {
                                setTimeout(() => {
                                    authService.logout();
                                }, 500);
                                this.props.onLogout();
                            }}
                            ><VpnKey/>&nbsp;&nbsp;Logout</Button><br/>
                            {this.state.displayAddToHomeButton &&
                            <Button onClick={() => {
                                pwaService.triggerAddToHomeScreen();
                            }}><VpnKey/>&nbsp;&nbsp;Add application to screen</Button>}
                        </div>
                    </div>
                </div>}
                {this.state.loading && <CircularProgress size={80} thickness={5}/>}
            </div>
        )
    }
}