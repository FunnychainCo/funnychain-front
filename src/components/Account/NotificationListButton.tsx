import * as React from 'react'
import {Component} from 'react'
import ListItem from "@material-ui/core/ListItem";
import {USER_ENTRY_NO_VALUE} from "../../service/generic/UserEntry";
import {authService} from "../../service/generic/AuthService";
import {Link} from 'react-router-dom';
import {userNotificationService} from "../../service/notification/UserNotificationService";
import ListItemText from "@material-ui/core/ListItemText";
import Badge from "@material-ui/core/Badge";
import {Bell, BellOff} from 'mdi-material-ui'; //https://materialdesignicons.com/

export default class NotificationListButton extends Component<{}, {}> {
    state = {
        user: USER_ENTRY_NO_VALUE,
        unseenNumber: 0,
        bell:false,
    };

    private removeListener: () => void = () => {
    };
    private removeListenerNumber: () => void = () => {
    };
    private removeListenerGranted: () => void = ()=>{};

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
        this.removeListenerNumber = userNotificationService.onUnseenNumberChange(number => {
            this.setState({unseenNumber: number});
        });

        this.removeListenerGranted = userNotificationService.onNotificationState(granted => {
            this.setState({bell:granted})
        })
    }

    componentWillUnmount() {
        this.removeListener();
        this.removeListenerNumber();
        this.removeListenerGranted();
    }

    handleClose = () => {
        this.setState({dialogOpen: false});
    };

    render() {
        const link = (props) => <Link to={"/user/" + this.state.user.uid + "/notification/list"} {...props} />;
        return (
            <div className="fcContent">
                <ListItem button component={link}>
                    <Badge color="secondary" badgeContent={this.state.unseenNumber}>
                        {this.state.bell?<Bell/>:<BellOff/>}<ListItemText primary={"Notifications"}/>
                    </Badge>
                </ListItem>
            </div>
        )
    }
}