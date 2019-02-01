import * as React from 'react';
import {Component} from 'react';
import "./Account.css";
import Drawer from "@material-ui/core/Drawer/Drawer";
import {USER_ENTRY_NO_VALUE} from "../../service/generic/UserEntry";
import {authService} from "../../service/generic/AuthService";
import FirebaseAccount from "./FirebaseAccount";

export default class AccountDrawer extends Component<{
    open: boolean,
    onRequestChange: (state: boolean) => void,
}, {}> {

    state = {
        user: USER_ENTRY_NO_VALUE
    };

    private removeListener: () => void;

    componentWillMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            if (this.state.user !== USER_ENTRY_NO_VALUE && user === USER_ENTRY_NO_VALUE) {
                //changed state from a user to no user means whe need to close the drawer (logout)
                this.props.onRequestChange(false);
            }
            this.setState({
                user: user
            });
        });
    }

    componentWillUnmount() {
        this.removeListener();
    }

    render() {
        return (
            <Drawer open={this.props.open}
                    onClose={() => this.props.onRequestChange(false)}>
                <div style={{minWidth: "40px"}}>
                    <FirebaseAccount/>
                </div>
            </Drawer>
        )
    }
}