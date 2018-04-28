import React, { Component } from 'react'
import {Dialog} from "material-ui";
import Register from "../Register/Register";

export default class LoginDialog extends Component {
    handleClose = () => {
        this.props.onRequestClose();
    };

    render () {
        return (
            <Dialog
                modal={false}
                open={this.props.open}
                onRequestClose={this.handleClose}
            >
                <Register onCompleted={this.handleClose}/>
            </Dialog>
        )
    }
}
