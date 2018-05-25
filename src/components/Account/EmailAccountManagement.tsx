import {Component} from 'react'
import * as React from 'react'
import {authService, USER_ENTRY_NO_VALUE} from "../../service/generic/AuthService";
import ModeEdit from '@material-ui/icons/ModeEdit';
import VpnKey from '@material-ui/icons/VpnKey';

import "./Account.css";
import ModalPage from "../ModalPage/ModalPage";
import {pwaService} from "../../service/PWAService";
import Button from "@material-ui/core/Button/Button";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import TextField from "@material-ui/core/TextField/TextField";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";

export default class Account extends Component<any,any> {
    state = {
        user: {
            uid:"",
            displayName:"",
            avatarUrl:"",
            email:""
        },
        loading: true,
        displayAddToHomeButton: false,
        dialog: {
            open: false,
            title: "",
            type: "",
            valid: false
        }
    };

    dialogValue:string = "";
    dialogValueCurrentPassword:string = "";
    userId:string = "";
    iid:string = "";
    private removeListener: () => void;
    private removeListenerPWA: any;

    componentWillMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            if (user==USER_ENTRY_NO_VALUE) {
                this.setState({
                    dialog: {
                        user: {},
                        loading: true
                    }
                });
            } else {
                this.userId = user.uid;
                console.log(user);
                this.setState({
                    user: user,
                    loading: false
                });
            }
        });

        this.removeListenerPWA = pwaService.on((callback) => {
            this.setState({displayAddToHomeButton: callback == null ? false : true});
        });
    }

    componentWillUnmount() {
        this.removeListener();
        this.removeListenerPWA();
    }

    handleClose = () => {
        this.setState({
            dialog: {
                title: "",
                open: false,
                type: null,
                valid: false
            }
        });
    };

    updateUser() {
        authService.loadUserData(this.userId).then((userData) => {
            console.log(userData);
            this.setState({
                user: userData,
                loading: false
            });
        });
    }

    handleSaveAndClose = () => {
        var newTextValue = this.dialogValue;
        this.dialogValue = "";
        switch (this.state.dialog.type) {
            case "email":
                authService.changeEmail(newTextValue).then(() => {
                    this.updateUser();
                });
                break;
            case "name":
                authService.changeDisplayName(newTextValue).then(() => {
                    this.updateUser();
                });
                break;
            case "password":
                authService.changePassword(this.dialogValueCurrentPassword, newTextValue).then(() => {
                    this.updateUser();
                });
                this.dialogValueCurrentPassword = "";
                break;
            default:
                console.error("error");
        }
        this.handleClose();
    };

    openChangeDisplayName = () => {
        this.setState({
            dialog: {
                title: "Change Display Name",
                open: true,
                type: "name",
                valid: false
            }
        });
    };

    openChangeEmail = () => {
        this.setState({
            dialog: {
                title: "Change Email",
                open: true,
                type: "email",
                valid: false
            }
        });
    };

    openChangePassword = () => {
        this.setState({
            dialog: {
                title: "Change Password",
                open: true,
                type: "password",
                valid: false
            }
        });
    };

    checkValidity() {
        var valid = true;
        if (this.state.dialog.type === "password") {
            valid = this.dialogValueCurrentPassword.replace(" ", "") !== "" && valid;
        }

        if (this.state.dialog.type !== "avatar") {
            valid = this.dialogValue.replace(" ", "") !== "" && valid;
        }

        this.state.dialog.valid = valid;
        this.setState({dialog: this.state.dialog});
    }

    render() {
        return (
            <div className="fcLeftAlignContainer">
                <div className="fcContent">
                    <Button onClick={this.openChangeDisplayName}
                    ><ModeEdit/>{this.state.user.displayName}</Button><br/>
                    <Button onClick={this.openChangeEmail}
                    ><ModeEdit/>{this.state.user.email}</Button><br/>
                    <Button onClick={this.openChangePassword}
                    ><VpnKey/>Change password</Button><br/>
                </div>
                <ModalPage
                    open={this.state.dialog.open}
                    onRequestClose={this.handleClose}
                >
                    <DialogTitle>{this.state.dialog.title}</DialogTitle>
                    <DialogContent>
                        {this.state.dialog.type === "password" &&
                        <TextField
                            onChange={(event) => {
                                this.dialogValueCurrentPassword = event.target.value;
                                this.checkValidity();
                            }}
                            type="password"
                            label="Current password"
                            fullWidth={true}/>
                        }
                        {this.state.dialog.type !== "avatar" &&
                        <TextField
                            onChange={(event) => {
                                this.dialogValue = event.target.value;
                                this.checkValidity();
                            }}
                            type={this.state.dialog.type === "password" ? "password" : "text"}
                            label={this.state.dialog.title}
                            fullWidth={true}/>
                        }
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={this.handleClose}
                        >Cancel</Button>
                        <Button
                            onClick={this.handleSaveAndClose}
                            disabled={!this.state.dialog.valid}
                        >Change</Button>
                    </DialogActions>
                </ModalPage>
            </div>
        )
    }
}