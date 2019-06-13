import * as React from 'react'
import {Component} from 'react'
import {authService} from "../../service/generic/AuthService";
import Edit from '@material-ui/icons/Edit';
import VpnKey from '@material-ui/icons/VpnKey';

import ModalPage from "../ModalPage/ModalPage";
import {pwaService} from "../../service/mobile/PWAService";
import Button from "@material-ui/core/Button/Button";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import TextField from "@material-ui/core/TextField/TextField";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import {USER_ENTRY_NO_VALUE, UserEntry} from "../../service/generic/UserEntry";
import {userService} from "../../service/generic/UserService";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {audit} from "../../service/log/Audit";
import {userNotificationService} from "../../service/notification/UserNotificationService";

export default class EmailAccountManagement extends Component<{}, {
    user:UserEntry,
    loading:boolean,
    displayAddToHomeButton:boolean,
    dialog:any,
}> {
    state = {
        user: USER_ENTRY_NO_VALUE,
        loading: true,
        displayAddToHomeButton: false,
        dialog: {
            open: false,
            title: "",
            type: "",
            valid: false
        }
    };

    dialogValue: string = "";
    dialogValueCurrentPassword: string = "";
    userId: string = "";
    iid: string = "";
    private removeListener: () => void = ()=>{};
    private removeListenerPWA: any;

    componentWillMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            if (user == USER_ENTRY_NO_VALUE) {
                this.setState({
                    dialog: {
                        user: {},
                        loading: true
                    }
                });
            } else {
                this.userId = user.uid;
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
        userService.loadUserData(this.userId).then((userData) => {
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
                }).catch(reason => {
                    userNotificationService.sendNotificationToUser(reason.message);
                });
                break;
            case "name":
                authService.changeDisplayName(newTextValue).then(() => {
                    this.updateUser();
                }).catch(reason => {
                    userNotificationService.sendNotificationToUser(reason.message);
                });
                break;
            case "password":
                authService.changePassword(this.dialogValueCurrentPassword, newTextValue).then(() => {
                    this.updateUser();
                }).catch(reason => {
                    userNotificationService.sendNotificationToUser(reason.message);
                });
                this.dialogValueCurrentPassword = "";
                break;
            default:
                audit.reportError("error");
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
            <div className="fcContent">

                <ListItem button onClick={this.openChangeDisplayName}>
                    <Edit /><ListItemText primary={this.state.user.displayName} />
                </ListItem>
                <ListItem button onClick={this.openChangeEmail}>
                    <Edit /><ListItemText primary={this.state.user.email} />
                </ListItem>
                <ListItem button onClick={this.openChangePassword}>
                    <VpnKey /><ListItemText primary="Change password" />
                </ListItem>
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