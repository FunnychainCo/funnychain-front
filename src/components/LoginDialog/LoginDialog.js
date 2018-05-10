import React, { Component } from 'react'
import Login from "../Login/Login";
import {DialogContent} from "material-ui";
import ModalPage from "../ModalPage/ModalPage";

export default class LoginDialog extends Component {
    handleClose = () => {
        this.props.onRequestClose();
    };

  render () {
    return (
        <ModalPage
            open={this.props.open}
            onClose={this.handleClose}
        >
            <DialogContent>
            <Login onLoginCompleted={this.handleClose}/>
            </DialogContent>
        </ModalPage>
    )
  }
}
