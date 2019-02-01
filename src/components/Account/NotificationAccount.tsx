import * as React from 'react'
import {Component} from 'react'
import "./Account.css";
import {Bell, BellOff} from 'mdi-material-ui'; //https://materialdesignicons.com/
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {userNotificationService} from "../../service/UserNotificationService";


export default class NotificationAccount extends Component<{}, {
    bell:boolean
}> {
    state = {
        bell:false
    };
    private removeListener: () => void = ()=>{};

    componentWillMount(){
        this.removeListener = userNotificationService.onNotificationState(granted => {
            this.setState({bell:granted})
        })
    }

    componentWillUnmount() {
        this.removeListener();
    }

    render() {
        return (
            <div className="fcContent">
                <ListItem button onClick={() => {
                    userNotificationService.setNotificationState(!this.state.bell);//toggle notification state
                }}>{this.state.bell?<Bell/>:<BellOff/>}<ListItemText primary="Notification"/>
                </ListItem>
            </div>
        )
    }
}