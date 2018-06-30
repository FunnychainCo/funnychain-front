import {Component} from 'react';
import * as React from 'react';
import ModalPage from "../ModalPage/ModalPage";
import {steemAuthService} from "../../service/steem/SteemAuthService";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import Button from "@material-ui/core/Button/Button";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import Divider from "@material-ui/core/Divider/Divider";
import List from "@material-ui/core/List/List";
import ListItem from "@material-ui/core/ListItem/ListItem";
import {MailOutline} from "@material-ui/icons";
import UserPasswordLoginDialog from "./UserPasswordLoginDialog";
import UserPasswordRegisterDialog from "./UserPasswordRegisterDialog";

export default class LoginRegisterDialog extends Component<any, any> {
    state = {
        loading: false,
        userPasswordLoginDialogOpen:false,
        userPasswordRegisterDialogOpen:false
    };


    componentDidMount() {
    }

    handleClose = () => {
        this.props.onRequestClose();
    };

    render() {
        return (
            <ModalPage
                open={this.props.open}
                onClose={this.handleClose}
            >
                {!this.state.loading && <DialogContent>
                    <List>
                        <ListItem>
                            <h3>Login</h3>
                        </ListItem>
                        <ListItem>
                            <Button
                                onClick={() => {this.setState({userPasswordLoginDialogOpen:true})}}
                                variant="raised"
                                fullWidth
                            >
                                <MailOutline />
                                &nbsp;&nbsp;Login
                            </Button>
                        </ListItem>
                        <ListItem>
                            <Button
                                onClick={() => {
                                    window.location.href = steemAuthService.getLoginURL();
                                }}
                                variant="raised"
                                fullWidth
                                style={{marginBottom: "20px", backgroundColor: "#4556e9"}}
                            >
                                <img src="/static/steem/steemit-logo.png" alt="steem"
                                     style={{width: "40px", height: "40px"}}/>
                                &nbsp;&nbsp;Login with steem account
                            </Button>
                        </ListItem>
                        <Divider light/>
                        <ListItem>
                            <h3>Create account</h3>
                        </ListItem>
                        <ListItem>
                            <Button
                                onClick={() => {this.setState({userPasswordRegisterDialogOpen:true})}}
                                variant="raised"
                                fullWidth
                            >
                                <MailOutline />
                                &nbsp;&nbsp;Create an account
                            </Button>
                        </ListItem>

                        <ListItem>
                            <Button
                                onClick={() => {
                                    window.location.href = "https://signup.steemit.com/?ref=funnychain"
                                }}
                                variant="raised"
                                fullWidth
                                style={{marginBottom: "20px", backgroundColor: "#4556e9"}}
                            >
                                <img src="/static/steem/steemit-logo.png" alt="steem"
                                     style={{width: "40px", height: "40px"}}/>
                                &nbsp;&nbsp;Sign up on steem.it
                            </Button>
                        </ListItem>
                    </List>
                </DialogContent>}
                {!this.state.loading && <DialogActions>
                    <Button onClick={this.handleClose} color="primary">
                        Cancel
                    </Button>
                </DialogActions>}
                {this.state.loading && <CircularProgress/>}
                <UserPasswordLoginDialog onRequestClose={()=>{this.handleClose()}} open={this.state.userPasswordLoginDialogOpen}/>
                <UserPasswordRegisterDialog onRequestClose={()=>{this.handleClose()}} open={this.state.userPasswordRegisterDialogOpen}/>
            </ModalPage>
        )
    }
}
