import * as React from 'react'
import {Component} from 'react'
import {authService} from "../../service/generic/AuthService";
import VpnKey from '@material-ui/icons/VpnKey';

import "./Account.css";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import NotificationAccount from "./NotificationAccount";
import InstallAppAccount from "./InstallAppAccount";
import ViewMyPostButton from "./ViewMyPostButton";

export default class CommonAccountManagement extends Component<{}, {
}> {
    state = {
    }


    render() {
        return (

            <div className="fcContent">
                <ViewMyPostButton/>
                <NotificationAccount />
                <InstallAppAccount/>

                <ListItem button onClick={() => {
                    authService.logout();
                }}><VpnKey/><ListItemText primary="Logout"/>
                </ListItem>

            </div>
        )
    }
}