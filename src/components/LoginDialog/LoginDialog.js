import React, {Component} from 'react'
import {Button, CircularProgress, DialogActions, DialogContent, TextField} from "material-ui";
import ModalPage from "../ModalPage/ModalPage";
import {authService} from "../../service/generic/AuthService";

export default class LoginDialog extends Component {
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
        authService.login(this.email, this.pw)
            .then(() => {
                console.log(this.email + " logged");
                this.setState({loading: false});
                this.handleClose();
            })
            .catch((error) => {
                this.setState({loading: false});
                console.log(error);
                this.setErrorMsg(error.message);
            });
    }

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
                            &nbsp;{this.state.errorMessage}<br/>
                            <a href="#" onClick={this.resetPassword}
                               className="alert-link">Forgot Password?</a>
                        </div>
                    }
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
