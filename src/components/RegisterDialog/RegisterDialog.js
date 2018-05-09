import React, { Component } from 'react'
import {Dialog} from "material-ui";
import Register from "../Register/Register";
import DialogContent from "material-ui/es/Dialog/DialogContent";
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
                <Register onCompleted={this.handleClose}/>
                </DialogContent>
            </ModalPage>
        )
    }
}
