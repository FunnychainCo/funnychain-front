import {Component} from 'react'
import * as React from 'react'
import {authService} from "../../service/generic/AuthService";
import VpnKey from '@material-ui/icons/VpnKey';

import "./Account.css";
import {pwaService} from "../../service/mobile/PWAService";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

export default class CommonAccountManagement extends Component<{ onLogout: () => void }, {
    displayAddToHomeButton: boolean
}> {
    state = {
        displayAddToHomeButton: false
    }
    private removeListenerPWA: () => void;

    componentWillMount() {
        this.removeListenerPWA = pwaService.on((callback) => {
            this.setState({displayAddToHomeButton: callback == null ? false : true});
        });
    }

    componentWillUnmount() {
        this.removeListenerPWA();
    }

    render() {
        return (

            <div className="fcContent">
                <ListItem button onClick={() => {
                    authService.logout().then(() => {
                        console.log("logout");
                        this.props.onLogout();
                    });
                }}><VpnKey/><ListItemText primary="Logout"/>
                </ListItem>

                {this.state.displayAddToHomeButton &&
                <ListItem button onClick={() => {
                    pwaService.triggerAddToHomeScreen();
                }}><VpnKey/><ListItemText primary="Add app to Home Screen"/>
                </ListItem>}
            </div>
        )
    }
}