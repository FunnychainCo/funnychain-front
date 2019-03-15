import * as React from 'react';
import {Component} from 'react';
import ModalPage from "../ModalPage/ModalPage";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import Button from "@material-ui/core/Button/Button";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import {userNotificationService} from "../../service/notification/UserNotificationService";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import InboxIcon from '@material-ui/icons/Inbox';
import {UiNotificationData} from "../../service/generic/Notification";

interface State {
    notifications: { [id: string]: UiNotificationData }
}

export default class NotificationList extends Component<{
    userid: string,
    onRequestClose: () => void,
    open: boolean,
}, State> {

    handleClose = () => {
        this.props.onRequestClose();
    };

    state: State = {
        notifications: {}
    };

    private removeCallback: (() => void) = () => {
    };

    componentWillMount() {
        userNotificationService.markAllAsSeen();
        this.restartMemeLoader(this.props.userid);
    }

    restartMemeLoader(uid: string) {
        this.removeCallback();
        this.removeCallback = userNotificationService.notifications.onEntry(entry => {
            let data = {};
            data[entry.hash] = entry.entry;
            this.setState((state) => ({notifications: {...state.notifications, ...data}}));//reset view
        }, hash => {
        },data => {});
    }

    componentWillUnmount() {
        this.removeCallback();
    }

    getOrderedKeys() {
        //Todo order
        return Object.keys(this.state.notifications);
    }

    render() {
        return (
            <ModalPage
                open={this.props.open}
                onClose={this.handleClose}
            >
                <DialogContent>
                    <List component="nav">
                        {
                            this.getOrderedKeys().map((key) => {
                                let notification = this.state.notifications[key];
                                return <ListItem key={key}>
                                    <ListItemIcon>
                                        <InboxIcon/>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={notification.title}
                                        secondary={notification.text}
                                    />
                                </ListItem>
                            })
                        }
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </ModalPage>
        )
    }
}
