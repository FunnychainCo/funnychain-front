import *as React from 'react';
import {Component} from 'react';
import ModalPage from "../ModalPage/ModalPage";
import {authService} from "../../service/generic/AuthService";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import TextField from "@material-ui/core/TextField/TextField";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import Button from "@material-ui/core/Button/Button";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";

export default class UserPasswordLoginDialog extends Component<{
    onRequestClose:()=>void,
    open:boolean
},any> {
    state = {
        errorMessage: null,
        displayButton: false,
        loading: false,
        resetEmailMode: false
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
        this.email=this.email.replace(" ","");
        authService.login(authService.MODE_EMAIL,JSON.stringify({email:this.email, password:this.pw}))
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
        this.setState({resetEmailMode:true});
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
                    {!this.state.resetEmailMode &&
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
                    }
                    {
                        this.state.errorMessage &&
                        <div className="alert alert-danger" role="alert">
                            <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                            <span className="sr-only">Error:</span>
                            &nbsp;{this.state.errorMessage}<br/>
                            {!this.state.resetEmailMode && <div onClick={this.resetPassword} className="alert-link">Forgot Password?</div>}
                        </div>
                    }
                </DialogContent>}
                {!this.state.loading && <DialogActions>
                    <Button onClick={this.handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={this.state.resetEmailMode?this.resetPassword:this.handleSubmit} color="primary">
                        {this.state.resetEmailMode?"Reset Password":"Login"}
                    </Button>
                </DialogActions>}
                {this.state.loading && <CircularProgress/>}
            </ModalPage>
        )
    }
}
