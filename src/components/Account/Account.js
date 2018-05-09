import React, {Component} from 'react'
import {authService} from "../../service/AuthService";
import {Avatar, CircularProgress, Dialog, Button, IconButton, Paper, TextField} from "material-ui";
import ModeEdit from '@material-ui/icons/ModeEdit';
import VpnKey from '@material-ui/icons/VpnKey';

import "./Account.css";
import ImageUploaderDropZone from "../ImageUploaderDropZone/ImageUploaderDropZone";
import ModalPage from "../ModalPage/ModalPage";
import DialogTitle from "material-ui/es/Dialog/DialogTitle";
import DialogContent from "material-ui/es/Dialog/DialogContent";
import DialogActions from "material-ui/es/Dialog/DialogActions";

export default class Account extends Component {
    state = {
        user: null,
        loading: true,
        dialog: {
            open: false,
            title: "",
            type: null,
            valid: false
        }
    };

    dialogValue = "";
    dialogValueCurrentPassword = "";
    userId = null;
    iid = "";

    componentDidMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            if (!user) {
                this.setState({
                    dialog: {
                        user: null,
                        loading: true
                    }
                });
            } else {
                this.userId = user.uid;
                this.updateUser();
            }
        });
    }

    componentWillUnmount() {
        this.removeListener();
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
            case "avatar":
                authService.changeAvatar(this.iid).then(() => {
                    this.updateUser();
                });
                this.iid = "";
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

    openChangeAvatar = () => {
        this.setState({
            dialog: {
                title: "Change Avatar",
                open: true,
                type: "avatar",
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

        if (this.state.dialog.type === "avatar") {
            valid = this.iid !== "" && this.iid !== null && valid;
        }
        this.state.dialog.valid = valid;
        this.setState({dialog: this.state.dialog});
    }

    onImageLoaded = (image) => {
        this.iid = image.iid;
        this.checkValidity();
    };

    render() {
        return (
            <div className="fcCenteredContainer">
                {!this.state.loading && <div className="accountPaper accountPaperWidth fcContent">
                    <div className="fcCenteredContainer">
                        <Avatar
                            onClick={this.openChangeAvatar}
                            className="fcContent fcAvatarContent"
                            src={this.state.user.avatar.url}
                        />
                    </div>
                    <div className="fcLeftAlignContainer">
                        <div className="fcContent">
                            <Button onClick={this.openChangeDisplayName}
                            ><ModeEdit/>{this.state.user.displayName}</Button><br/>
                            <Button onClick={this.openChangeEmail}
                            ><ModeEdit/>{this.state.user.email}</Button><br/>
                            <Button onClick={this.openChangePassword}
                            ><VpnKey/>Change password</Button><br/>
                            <Button onClick={() => {
                                setTimeout(() => {
                                    authService.logout();
                                }, 500);
                                this.props.onLogout();
                            }}
                            ><VpnKey/>Logout</Button><br/>
                        </div>
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
                            {this.state.dialog.type === "avatar" &&
                            <ImageUploaderDropZone onImageLoaded={this.onImageLoaded}/>
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
                </div>}
                {this.state.loading && <CircularProgress size={80} thickness={5}/>}
            </div>
        )
    }
}