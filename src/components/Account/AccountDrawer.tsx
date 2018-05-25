import {Component} from 'react';
import * as React from 'react'
import "./Account.css";
import Account from "./Account";
import Drawer from "@material-ui/core/Drawer/Drawer";

export default class AccountDrawer extends Component<{
    open:boolean,
    onRequestChange: (state:boolean) => void,
}> {
    render() {
        return (
            <Drawer open={this.props.open}
                    onClose={() => this.props.onRequestChange(false)}>
                <Account onLogout={() => this.props.onRequestChange(false)}/>
            </Drawer>
        )
    }
}