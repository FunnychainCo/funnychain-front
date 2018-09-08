import {Component} from 'react';
import * as React from 'react';
import ModalPage from "../ModalPage/ModalPage";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import Button from "@material-ui/core/Button/Button";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import List from "@material-ui/core/List/List";
import ListItem from "@material-ui/core/ListItem/ListItem";
import {MailOutline} from "@material-ui/icons";
import UserPasswordLoginDialog from "./UserPasswordLoginDialog";
import UserPasswordRegisterDialog from "./UserPasswordRegisterDialog";
import {EmoticonCool} from 'mdi-material-ui';
import ListItemText from "@material-ui/core/ListItemText";
import AboutUsDialog from "./AboutUsDialog";

interface State {
    loading: boolean,
    userPasswordLoginDialogOpen: boolean,
    userPasswordRegisterDialogOpen: boolean,
    aboutUsOpen:boolean,
}

export default class LoginRegisterDialogV2 extends Component<{
    onRequestClose: () => void,
    open: boolean
}, State> {
    state: State = {
        loading: false,
        userPasswordLoginDialogOpen: false,
        userPasswordRegisterDialogOpen: false,
        aboutUsOpen:false,
    };


    componentDidMount() {
    }

    handleClose = () => {
        this.setState({userPasswordLoginDialogOpen: false, userPasswordRegisterDialogOpen: false,aboutUsOpen:false});
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
                                    this.setState({aboutUsOpen: true})
                                }}
                                variant="raised"
                                fullWidth
                            ><EmoticonCool/><ListItemText primary="About Funnychain"/>
                            </Button>
                        </ListItem>
                        <ListItem>
                            <Button
                                onClick={() => {
                                    this.setState({userPasswordLoginDialogOpen: true})
                                }}
                                variant="raised"
                                fullWidth
                            ><MailOutline/><ListItemText primary="Login"/>
                            </Button>
                        </ListItem>
                        <ListItem>
                            <Button
                                onClick={() => {
                                    this.setState({userPasswordRegisterDialogOpen: true})
                                }}
                                variant="raised"
                                fullWidth
                            ><MailOutline/><ListItemText primary="Create an account"/>
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
                <AboutUsDialog onRequestClose={() => {
                    this.handleClose()
                }} open={this.state.aboutUsOpen} />

            </ModalPage>
        )
    }
}
