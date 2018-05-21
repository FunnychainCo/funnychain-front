import {Component} from 'react'
import * as React from 'react'
import {authService, USER_ENTRY_NO_VALUE} from "../../service/generic/AuthService";
import {Avatar, Button} from "material-ui";

import "./Account.css";
import ImageUploaderDropZone from "../ImageUploaderDropZone/ImageUploaderDropZone";
import ModalPage from "../ModalPage/ModalPage";
import {DialogTitle} from "material-ui";
import {DialogContent} from "material-ui";
import {DialogActions} from "material-ui";
import {pwaService} from "../../service/PWAService";

export default class Account extends Component<any,any> {
    state = {
        user: {
            uid:"",
            displayName:"",
            avatarUrl:""
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
                        user: null,
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
        this.dialogValue = "";
        authService.changeAvatar(this.iid).then(() => {
            this.updateUser();
        });
        this.iid = "";
        this.handleClose();
    };

    checkValidity() {
        this.state.dialog.valid = this.iid !== "" && this.iid !== null;
        this.setState({dialog: this.state.dialog});
    }

    onImageLoaded = (image) => {
        this.iid = image.iid;
        this.checkValidity();
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

    render() {
        return (
            <div className="fcCenteredContainer">
                <Avatar
                    onClick={this.openChangeAvatar}
                    className="fcContent fcAvatarContent"
                    src={this.state.user.avatarUrl}
                />
                <ModalPage
                    open={this.state.dialog.open}
                    onRequestClose={this.handleClose}
                >
                    <DialogTitle>{this.state.dialog.title}</DialogTitle>
                    <DialogContent>
                        <ImageUploaderDropZone onImageLoaded={this.onImageLoaded}/>
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