import React, { Component } from 'react'
import {Dialog} from "material-ui";
import Login from "../Login/Login";

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
            <Login onLoginCompleted={this.handleClose}/>
        </Dialog>
    )
  }
}
