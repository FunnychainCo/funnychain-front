import {Component} from 'react';
import * as React from 'react';
import ModalPage from "../ModalPage/ModalPage";
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

interface State {
    loading: boolean,
    userPasswordLoginDialogOpen: boolean,
    userPasswordRegisterDialogOpen: boolean
}

export default class LoginRegisterDialogV2 extends Component<
    {
        onRequestClose: () => void,
        open: boolean
    }, State> {
    state: State = {
        loading: false,
        userPasswordLoginDialogOpen: false,
        userPasswordRegisterDialogOpen: false
    };


    componentDidMount() {
    }

    handleClose = () => {
        this.setState({userPasswordLoginDialogOpen: false, userPasswordRegisterDialogOpen: false});
        this.props.onRequestClose();
        console.log("ici");
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
                            <Button
                                onClick={() => {
                                    this.setState({userPasswordLoginDialogOpen: true})
                                }}
                                variant="raised"
                                fullWidth
                            >
                                <MailOutline/>
                                &nbsp;&nbsp;Login
                            </Button>
                        </ListItem>
                        <Divider light/>
                        <ListItem>
                            <Button
                                onClick={() => {
                                    this.setState({userPasswordRegisterDialogOpen: true})
                                }}
                                variant="raised"
                                fullWidth
                            >
                                <MailOutline/>
                                &nbsp;&nbsp;Create an account
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
                <UserPasswordLoginDialog onRequestClose={() => {
                    this.handleClose()
                }} open={this.state.userPasswordLoginDialogOpen}/>
                <UserPasswordRegisterDialog onRequestClose={() => {
                    this.handleClose()
                }} open={this.state.userPasswordRegisterDialogOpen}/>
            </ModalPage>
        )
    }
}
