import * as React from 'react';
import {Component} from 'react';
import {authService} from "../../service/generic/AuthService";
import Avatar from "@material-ui/core/Avatar/Avatar";
import {USER_ENTRY_NO_VALUE, UserEntry} from "../../service/generic/UserEntry";
import {Menu} from "@material-ui/icons";
import ButtonBase from "@material-ui/core/ButtonBase";

export default class Logged extends Component<{
    component: any,
    onAccountClick: () => void
},
    {
        user: UserEntry
    }> {
    state = {
        user: USER_ENTRY_NO_VALUE
    };
    private removeListener: () => void;

    componentDidMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            this.setState({user: user});
        })
    }

    componentWillUnmount() {
        this.removeListener();
    }

    render() {
        return <ButtonBase
            component={this.props.component}
            onClick={this.props.onAccountClick}>
            {(this.state.user.avatarUrl !== "") &&
            <Avatar src={this.state.user.avatarUrl}/>
            }
            {(this.state.user.avatarUrl === "") &&
            <Menu/>
            }
        </ButtonBase>
    }
}