import {Component} from 'react'
import * as React from 'react'
import "./Account.css";
//import {Ethereum} from 'mdi-material-ui';
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
import List from "@material-ui/core/List";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import InboxIcon from '@material-ui/icons/Inbox';
import {walletService} from "../../service/firebase/WalletService";
import {FirebaseTransaction} from "../../service/firebase/shared/FireBaseDBDefinition";
import DogeIcon from "../Icon/DogeIcon";
import {audit} from "../../service/Audit";
//https://materialdesignicons.com/

export default class WalletAccount extends Component<{}, {}> {
    state = {
        user: USER_ENTRY_NO_VALUE,
        loading: true,
        dialogOpen: false,
        sendTokenValid: false,
        transactions: []
    };

    private removeListener: () => void;
    dialogAddrDest: string;
    dialogAmount: string;

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

    handleClose = () => {
        this.setState({dialogOpen: false});
    };
    handleSaveAndClose = () => {
        console.warn("send " + this.dialogAmount + " to " + this.dialogAddrDest);
        this.setState({dialogOpen: false});
    };

    private checkValidity() {
        //TODO send firebase request
        console.warn("send firebase request");
    }

    loadWalletTransaction() {
        walletService.getTransaction(this.state.user.uid).then(transactions => {
            this.setState({transactions: transactions});
        });
    }

    render() {
        return (

            <div className="fcContent">
                <ListItem button onClick={() => {
                    this.setState({dialogOpen: true});
                    this.loadWalletTransaction();
                }}><DogeIcon/><ListItemText primary={(this.state.user.wallet).toFixed(2) + ""}/></ListItem>
                <ModalPage
                    open={this.state.dialogOpen}
                    onRequestClose={this.handleClose}
                >
                    <DialogTitle>Send token</DialogTitle>
                    <DialogContent>
                        Current account address : {this.state.user.uid} <br/><br/>

                        <TextField
                            variant="outlined"
                            onChange={(event) => {
                                this.dialogAddrDest = event.target.value;
                                this.checkValidity();
                            }}
                            type={"text"}
                            label={"destination account"}
                            fullWidth={true}/>
                        <br/><br/>
                        <TextField
                            variant="outlined"
                            onChange={(event) => {
                                this.dialogAmount = event.target.value;
                                this.checkValidity();
                            }}
                            type={"text"}
                            label={"amount"}
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
                    <DialogTitle>Transaction History</DialogTitle>
                    <DialogContent>
                        <List component="nav">
                            {this.state.transactions.map((value:FirebaseTransaction, index, array) => {
                                let addreseMessage = "";
                                if (value.src === this.state.user.uid) {
                                    addreseMessage = "To " + value.dst;
                                    value.amount = -value.amount;
                                } else if (value.dst === this.state.user.uid) {
                                    addreseMessage = "From " + value.src;
                                } else {
                                    audit.reportError(value);
                                }
                                return <ListItem key={index}>
                                    <ListItemIcon>
                                        <InboxIcon/>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={value.amount + " LOL"}
                                        secondary={addreseMessage}
                                    />
                                </ListItem>
                            })
                            }
                        </List>
                    </DialogContent>
                </ModalPage>
            </div>

        )
    }
}