import * as React from 'react'
import {Component} from 'react'
import {authService} from "../../service/generic/AuthService";
import Edit from '@material-ui/icons/Edit';

import "./Account.css";
import Avatar from "@material-ui/core/Avatar/Avatar";
import Button from "@material-ui/core/Button/Button";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import {USER_ENTRY_NO_VALUE, UserEntry} from "../../service/generic/UserEntry";
import CommonAccountManagement from "./CommonAccountManagement";

export default class SteemAccount extends Component<{
    onLogout: () => void
}, {
    user: UserEntry,
    loading: boolean
}> {
    state = {
        user: USER_ENTRY_NO_VALUE,
        loading: true
    };

    private removeListener: () => void;

    private openSteemAccount = () => {
        window.location.href = "https://steemit.com/@" + this.state.user.uid;
    };

    componentWillMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            if (user == USER_ENTRY_NO_VALUE) {
                this.setState({
                    loading: true
                });
            } else {
                this.setState({
                    user: user,
                    loading: false
                });
            }
        });
    }

    componentWillUnmount() {
        this.removeListener();
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
                            <Button onClick={this.openSteemAccount}>
                                <Edit/>&nbsp;&nbsp;{this.state.user.displayName}
                                </Button>
                        </div>
                        <CommonAccountManagement/>
                    </div>
                </div>}
                {this.state.loading && <CircularProgress size={80} thickness={5}/>}
            </div>
        )
    }
}