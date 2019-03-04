import * as React from 'react'
import {Component} from 'react'
import "./Account.css";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {USER_ENTRY_NO_VALUE} from "../../service/generic/UserEntry";
import {authService} from "../../service/generic/AuthService";
import {userService} from "../../service/generic/UserService";
import LolTokenIcon from "../Icon/LolTokenIcon";
import {Link} from 'react-router-dom';

export default class WalletAccount extends Component<{}, {}> {
    state = {
        user: USER_ENTRY_NO_VALUE,
        loading: true,
        sendTokenValid: false
    };

    private removeListener: () => void = ()=>{};

    componentWillMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            if (user == USER_ENTRY_NO_VALUE) {
                this.setState({
                    loading: true
                });
            } else {
                userService.computeWalletValue(user.uid).then(balance => {
                    user.wallet = balance;
                    this.setState({
                        user: user,
                        loading: false
                    });
                });
            }
        });
    }

    componentWillUnmount() {
        this.removeListener();
    }

    handleClose = () => {
        this.setState({dialogOpen: false});
    };

    render() {
        const walletLink = (props) => <Link to={"/user/current/wallet"} {...props} />;
        return (
            <div className="fcContent">
                <ListItem button component={walletLink}><LolTokenIcon/><ListItemText primary={(this.state.user.wallet).toFixed(2) + ""}/></ListItem>
            </div>
        )
    }
}