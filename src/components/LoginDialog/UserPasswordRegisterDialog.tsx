import { Component } from 'react';
import * as React from 'react';
import ModalPage from "../ModalPage/ModalPage";
import {authService} from "../../service/generic/AuthService";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import TextField from "@material-ui/core/TextField/TextField";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import Button from "@material-ui/core/Button/Button";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";

export default class UserPasswordRegisterDialog extends Component<any,any> {
    state = {
        errorMessage: null,
        displayButton: false,
        loading: false
    };

    email = "";
    pw = "";

    setErrorMsg(error) {
        this.setState({errorMessage: error});
    }

    handleClose = () => {
        this.props.onRequestClose();
    };

    handleSubmit = () => {
        this.setState({loading: true});
        authService.register(this.email, this.pw)
            .then(() => {
                console.log(this.email + " registred");
                this.setState({loading: false});
                this.handleClose();
            })
            .catch((error) => {
                this.setState({loading: false});
                console.log(error);
                if(error['message']!=undefined) {
                    this.setErrorMsg(error.message);
                }else{
                    this.setErrorMsg(error);
                }
            });
    };

    resetPassword = () => {
        authService.resetPassword(this.email)
            .then(() => this.setErrorMsg(`Password reset email sent to ${this.email}.`))
            .catch((error) => this.setErrorMsg(`Email address not found.`))
    }

    render() {
        return (
            <ModalPage
                open={this.props.open}
                onClose={this.handleClose}
            >
                {!this.state.loading && <DialogContent>
                    <TextField
                        label="Email"
                        fullWidth
                        margin="normal"
                        onChange={(event) => {
                            this.email = event.target.value
                        }}
                    />
                    <TextField
                        label="Password"
                        fullWidth
                        type="password"
                        autoComplete="current-password"
                        margin="normal"
                        onChange={(event) => {
                            this.pw = event.target.value
                        }}
                    />
                    {
                        this.state.errorMessage &&
                        <div className="alert alert-danger" role="alert">
                            <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                            <span className="sr-only">Error:</span>
                            &nbsp;{this.state.errorMessage}
                        </div>
                    }
                </DialogContent>}
                {!this.state.loading && <DialogActions>
                    <Button onClick={this.handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={this.handleSubmit} color="primary">
                        Register
                    </Button>
                </DialogActions>}
                {this.state.loading && <CircularProgress/>}
            </ModalPage>
        )
    }
}
