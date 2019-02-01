import * as React from 'react'
import {Component} from 'react'
import "./Account.css";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {USER_ENTRY_NO_VALUE} from "../../service/generic/UserEntry";
import {authService} from "../../service/generic/AuthService";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import ModalPage from "../ModalPage/ModalPage";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import {userService} from "../../service/generic/UserService";
import List from "@material-ui/core/List";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import InboxIcon from '@material-ui/icons/Inbox';
import {walletService} from "../../service/firebase/WalletService";
import {FirebaseTransaction} from "../../service/firebase/shared/FireBaseDBDefinition";
import {audit} from "../../service/Audit";
import LolTokenIcon from "../Icon/LolTokenIcon";
import moment from "moment";
import {userNotificationService} from "../../service/UserNotificationService";

export default class WalletAccount extends Component<{}, {}> {
    state = {
        user: USER_ENTRY_NO_VALUE,
        loading: true,
        dialogOpen: false,
        sendTokenValid: false,
        transactions: []
    };

    private removeListener: () => void = ()=>{};
    dialogAddrDest: string = "";
    dialogAmount: string = "0";

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

    handleProcessTransaction = () => {
        console.warn("send " + this.dialogAmount + " to " + this.dialogAddrDest);
        userService.transfer(this.dialogAddrDest, +this.dialogAmount).then(value => {
            userNotificationService.sendNotificationToUser("Transaction registered");
        });
        this.handleClose();
    };

    private checkValidity() {
        //TODO send firebase request
        console.warn("send firebase request");
        //1) check if account exist
        let valide1 = this.dialogAddrDest.length === 28;//TODO find a better way to check
        //2) check if value is correct according to balance
        let valide2 = (this.state.user.wallet >= +this.dialogAmount) && (+this.dialogAmount > 0.0);
        this.setState({sendTokenValid: valide1 && valide2});
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
                }}><LolTokenIcon/><ListItemText primary={(this.state.user.wallet).toFixed(2) + ""}/></ListItem>
                <ModalPage
                    open={this.state.dialogOpen}
                    onRequestClose={this.handleClose}
                >
                    <DialogTitle>Send token</DialogTitle>
                    <DialogContent>
                        Current account address : {this.state.user.uid}<br/><br/>

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
                        <Button
                            onClick={this.handleClose}
                        >Cancel</Button>
                        <Button
                            onClick={this.handleProcessTransaction}
                            disabled={!this.state.sendTokenValid}
                        >Send</Button>
                        <List component="nav">
                            {this.state.transactions.map((value: FirebaseTransaction, index, array) => {
                                let addressMessage = "ERROR";
                                let date = moment(value.date).fromNow();
                                let amount = "ERROR";
                                if (value.src === this.state.user.uid) {
                                    addressMessage = "To " + value.dst;
                                    amount = "" + (-value.amount);
                                } else if (value.dst === this.state.user.uid) {
                                    addressMessage = "From " + value.src;
                                    amount = "" + value.amount;
                                } else {
                                    audit.reportError(value);
                                }
                                return <ListItem key={index}>
                                    <ListItemIcon>
                                        <InboxIcon/>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={amount + " LOL"}
                                        secondary={addressMessage + " " + date}
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