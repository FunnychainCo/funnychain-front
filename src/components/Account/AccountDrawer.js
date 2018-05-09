import React, {Component} from 'react'
import "./Account.css";
import Account from "./Account";
import {Drawer} from "material-ui";

export default class AccountDrawer extends Component {
    render() {
        return (
            <Drawer open={this.props.open}
                    onClose={() => this.props.onRequestChange(false)}>
                <Account onLogout={() => this.props.onRequestChange(false)}/>
            </Drawer>
        )
    }
}