import * as React from 'react';
import {Component} from 'react';
import {authService} from "../../service/generic/AuthService";
import Avatar from "@material-ui/core/Avatar/Avatar";
import {USER_ENTRY_NO_VALUE, UserEntry} from "../../service/generic/UserEntry";
import {Menu} from "@material-ui/icons";
import ButtonBase from "@material-ui/core/ButtonBase";
import Badge from "@material-ui/core/Badge";
import {userNotificationService} from "../../service/notification/UserNotificationService";

export default class Logged extends Component<{
    component: any,
    onAccountClick: () => void
}, {
    user: UserEntry
    unseenNumber: number,
}> {

    public static defaultProps = {
        component: undefined
    };

    state = {
        user: USER_ENTRY_NO_VALUE,
        unseenNumber: 0,
    };

    private removeListener: () => void = () => {
    };
    private removeListenerNumber: () => void = () => {
    };

    componentDidMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            this.setState({user: user});
        });

        this.removeListenerNumber = userNotificationService.onUnseenNumberChange(number => {
            this.setState({unseenNumber: number});
        });
    }

    componentWillUnmount() {
        this.removeListener();
        this.removeListenerNumber();
    }

    render() {
        return <ButtonBase
            component={this.props.component}
            onClick={this.props.onAccountClick}>
            {(this.state.user.avatarUrl !== "") &&

            <Badge color="secondary" badgeContent={this.state.unseenNumber}>
                <Avatar src={this.state.user.avatarUrl}/>
            </Badge>
            }
            {(this.state.user.avatarUrl === "") &&
            <Menu/>
            }
        </ButtonBase>
    }
}