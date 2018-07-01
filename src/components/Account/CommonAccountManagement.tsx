import {Component} from 'react'
import * as React from 'react'
import {authService} from "../../service/generic/AuthService";
import VpnKey from '@material-ui/icons/VpnKey';

import "./Account.css";
import {pwaService} from "../../service/mobile/PWAService";
import Button from "@material-ui/core/Button/Button";
import {ChatBubble} from "@material-ui/icons";

export default class CommonAccountManagement extends Component<{ onLogout: () => void }, {
    displayAddToHomeButton: boolean
}> {
    state = {
        displayAddToHomeButton: false
    }
    private removeListenerPWA: () => void;

    componentWillMount(){
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
                <Button onClick={() => {
                    window.location.href = "https://discord.gg/9NmfPXc"
                }}>
                    <ChatBubble/>&nbsp;&nbsp;Join on discord
                </Button><br/>
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
                }}><VpnKey/>&nbsp;&nbsp;Add app to Home Screen</Button>}
            </div>
        )
    }
}