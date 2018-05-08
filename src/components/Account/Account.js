import React, {Component} from 'react'
import {authService} from "../../service/AuthService";
import {Avatar, CircularProgress, Dialog, FlatButton, IconButton, Paper, TextField} from "material-ui";
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit';
import VpnKey from 'material-ui/svg-icons/communication/vpn-key';

import "./Account.css";
import ImageUploaderDropZone from "../ImageUploaderDropZone/ImageUploaderDropZone";
import Link from "react-router-dom/es/Link";

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
            if(!user){
                this.setState({
                    dialog: {
                        user: null,
                        loading:true
                    }
                });
            }else {
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
                {!this.state.loading && <Paper className="accountPaper accountPaperWidth fcContent" zDepth={2}>
                    <div className="fcCenteredContainer">
                        <Avatar
                            onClick={this.openChangeAvatar}
                            className="fcContent fcAvatarContent"
                            src={this.state.user.avatar.url}
                            size={200}/>
                    </div>
                    <div className="fcCenteredContainer">
                        <div className="fcContent">
                            <IconButton onClick={this.openChangeDisplayName} className="fcEditButton"
                                        tooltip="Edit"><ModeEdit/></IconButton>{this.state.user.displayName}
                        </div>
                    </div>
                    <div className="fcCenteredContainer">
                        <div className="fcContent">
                            <IconButton onClick={this.openChangeEmail} className="fcEditButton"
                                        tooltip="Edit"><ModeEdit/></IconButton>{this.state.user.email}
                        </div>
                    </div>
                    <div className="fcCenteredContainer">
                        <div className="fcContent">
                            <FlatButton
                                onClick={this.openChangePassword}
                                label="Change password"
                                icon={<VpnKey/>}
                            />
                        </div>
                    </div>
                    <div className="fcCenteredContainer">
                        <div className="fcContent">
                            <Link to="/"><FlatButton
                                onClick={()=>{setTimeout(()=>{authService.logout();},500)}} //aplly link then logout
                                label="Logout"
                                icon={<VpnKey/>}
                            /></Link>
                        </div>
                    </div>

                    <Dialog
                        title={this.state.dialog.title}
                        actions={[
                            <FlatButton
                                label="Cancel"
                                primary={true}
                                onClick={this.handleClose}
                            />,
                            <FlatButton
                                label="Change"
                                primary={true}
                                onClick={this.handleSaveAndClose}
                                disabled={!this.state.dialog.valid}
                            />,
                        ]}
                        modal={false}
                        open={this.state.dialog.open}
                        onRequestClose={this.handleClose}
                    >
                        {this.state.dialog.type === "password" &&
                        <TextField
                            onChange={(obj, newString) => {
                                this.dialogValueCurrentPassword = newString;
                                this.checkValidity();
                            }}
                            type="password"
                            floatingLabelText="Current password"
                            fullWidth={true}/>
                        }
                        {this.state.dialog.type !== "avatar" &&
                        <TextField
                            onChange={(obj, newString) => {
                                this.dialogValue = newString;
                                this.checkValidity();
                            }}
                            type={this.state.dialog.type === "password" ? "password" : "text"}
                            floatingLabelText={this.state.dialog.title}
                            fullWidth={true}/>
                        }
                        {this.state.dialog.type === "avatar" &&
                        <ImageUploaderDropZone onImageLoaded={this.onImageLoaded}/>
                        }
                    </Dialog>
                </Paper>}
                {this.state.loading && <CircularProgress size={80} thickness={5}/>}
            </div>
        )
    }
}