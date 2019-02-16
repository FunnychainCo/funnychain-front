import * as React from 'react'
import {Component} from 'react'
import {authService} from "../../service/generic/AuthService";
import "./Account.css";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import {USER_ENTRY_NO_VALUE, UserEntry} from "../../service/generic/UserEntry";
import AvatarAccountManagement from "./AvatarAccountManagement";
import CommonAccountManagement from "./CommonAccountManagement";
import EmailAccountManagement from "./EmailAccountManagement";
import Divider from "@material-ui/core/Divider";
import ExternalLinkAccount from "./ExternalLinkAccount";
import WalletAccount from "./WalletAccount";

export default class EmailAccount extends Component<{}, {
    user: UserEntry,
    loading: boolean,
}> {
    state = {
        user: USER_ENTRY_NO_VALUE,
        loading: true,
    };

    private removeListener: () => void = ()=>{};

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
                        <AvatarAccountManagement/>
                    </div>
                    <div className="fcLeftAlignContainer">
                        <div className="fcContent">
                            <Divider />
                            <WalletAccount/>
                            <Divider />
                            <EmailAccountManagement/>
                            <Divider/>
                            <ExternalLinkAccount />
                            <Divider />
                            <CommonAccountManagement/>
                            <Divider />
                        </div>
                    </div>
                </div>}
                {this.state.loading && <CircularProgress size={80} thickness={5}/>}
            </div>
        )
    }
}