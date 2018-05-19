import React, {Component} from 'react'
import {Button, CircularProgress, DialogActions, DialogContent, TextField} from "material-ui";
import ModalPage from "../ModalPage/ModalPage";
import {Redirect} from "react-router-dom";
import {steemAuthService} from "../../service/steem/SteemAuthService";

export default class SteemLoginDialog extends Component {
    state = {
        loading: false
    };


    componentDidMount(){
    }

    handleClose = () => {
        this.props.onRequestClose();
    };

    handleSubmit = () => {
        window.location.href = steemAuthService.getLoginURL();
    };

    render() {
        return (
            <ModalPage
                open={this.props.open}
                onClose={this.handleClose}
            >
                {!this.state.loading && <DialogContent>

                </DialogContent>}
                {!this.state.loading && <DialogActions>
                    <Button onClick={this.handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={this.handleSubmit} color="primary">
                        Login
                    </Button>
                </DialogActions>}
                {this.state.loading && <CircularProgress/>}
            </ModalPage>
        )
    }
}
