import {Component} from 'react'
import * as React from 'react'
import "./Account.css";
import { Ethereum } from 'mdi-material-ui';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {USER_ENTRY_NO_VALUE} from "../../service/generic/UserEntry";
import {authService} from "../../service/generic/AuthService";
//https://materialdesignicons.com/

export default class WalletAccount extends Component<{}, {
}> {
    state = {
        user: USER_ENTRY_NO_VALUE,
        loading: true,
    };

    private removeListener: () => void;

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

            <div className="fcContent">
                <ListItem ><Ethereum /><ListItemText primary={(this.state.user.wallet).toFixed(2) +" LOL"} /></ListItem>
            </div>
        )
    }
}