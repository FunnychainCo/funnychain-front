import * as React from 'react'
import {Component} from 'react'
import {authService} from "../../service/generic/AuthService";

import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import InstallAppAccount from "./InstallAppAccount";
import ViewMyPostButton from "./ViewMyPostButton";
import {deviceDetector} from "../../service/mobile/DeviceDetector";
import {Refresh} from "mdi-material-ui";
import VpnKey from '@material-ui/icons/VpnKey';

export default class CommonAccountManagement extends Component<{}, {
}> {
    state = {
    }


    render() {
        return (

            <div className="fcContent">
                <ViewMyPostButton/>
                {!deviceDetector.isMobileAppRender() &&
                    <InstallAppAccount/>
                }

                <ListItem button onClick={() => {
                    document.location.reload();
                }}><Refresh/><ListItemText primary="Refresh"/>
                </ListItem>

                <ListItem button onClick={() => {
                    authService.logout();
                    document.location.reload();
                }}><VpnKey/><ListItemText primary="Logout"/>
                </ListItem>

            </div>
        )
    }
}