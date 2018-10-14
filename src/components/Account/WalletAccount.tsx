import {Component} from 'react'
import * as React from 'react'
import "./Account.css";
import { Ethereum } from 'mdi-material-ui';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {USER_ENTRY_NO_VALUE} from "../../service/generic/UserEntry";
import {authService} from "../../service/generic/AuthService";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import ModalPage from "../ModalPage/ModalPage";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import {userService} from "../../service/generic/UserService";
//https://materialdesignicons.com/

export default class WalletAccount extends Component<{}, {
}> {
    state = {
        user: USER_ENTRY_NO_VALUE,
        loading: true,
        dialogOpen:false,
        sendTokenValid:false
    };

    private removeListener: () => void;
    dialogAddrDest: string;
    dialogAmmount: string;

    componentWillMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            if (user == USER_ENTRY_NO_VALUE) {
                this.setState({
                    loading: true
                });
            } else {
                userService.computeWalletValue(user.uid).then(balance => {
                    user.wallet = balance;
                    this.setState({
                        user: user,
                        loading: false
                    });
                });
            }
        });
    }

    componentWillUnmount() {
        this.removeListener();
    }

    handleClose = () =>{
        this.setState({dialogOpen:false});
    };
    handleSaveAndClose = ()=>{
        console.warn("send "+this.dialogAmmount+" to "+this.dialogAddrDest);
        this.setState({dialogOpen:false});
    };

    private checkValidity() {
        //TODO send firebase request
        console.warn("send firebase request");
    }

    render() {
        return (

            <div className="fcContent">
                <ListItem button onClick={() => {
                    this.setState({dialogOpen:true});
                }}><Ethereum /><ListItemText primary={(this.state.user.wallet).toFixed(2) +" LOL"} /></ListItem>
                <ModalPage
                    open={this.state.dialogOpen}
                    onRequestClose={this.handleClose}
                >
                    <DialogTitle>Send token</DialogTitle>
                    <DialogContent>
                        Current account address : {this.state.user.uid} <br /><br />

                        <TextField
                            variant="outlined"
                            onChange={(event) => {
                                this.dialogAddrDest = event.target.value;
                                this.checkValidity();
                            }}
                            type={"text"}
                            label={"destination account"}
                            fullWidth={true}/>
                        <br /><br />
                        <TextField
                            variant="outlined"
                            onChange={(event) => {
                                this.dialogAmmount = event.target.value;
                                this.checkValidity();
                            }}
                            type={"text"}
                            label={"ammount"}
                            fullWidth={true}/>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={this.handleClose}
                        >Cancel</Button>
                        <Button
                            onClick={this.handleSaveAndClose}
                            disabled={!this.state.sendTokenValid}
                        >Send</Button>
                    </DialogActions>
                </ModalPage>
            </div>

        )
    }
}