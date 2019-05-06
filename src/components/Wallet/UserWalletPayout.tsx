import * as React from 'react'
import {Component} from 'react'
import List from "@material-ui/core/List/List";
import {lolTokenService} from "../../service/generic/LolTokenService";
import {userNotificationService} from "../../service/notification/UserNotificationService";
import Paper from "@material-ui/core/Paper/Paper";
import ListItem from "@material-ui/core/ListItem/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import Typography from "@material-ui/core/Typography/Typography";
import {audit} from "../../service/log/Audit";
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";
import TextField from "@material-ui/core/TextField/TextField";
import Button from "@material-ui/core/Button/Button";
import Dialog from "@material-ui/core/Dialog/Dialog";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import {walletService} from "../../service/generic/WalletService";

function PaypalPayout(euroValue: number, lolValue: number, userbalance: number, onclick: (euroValue: number, lolValue: number) => void) {
    const isDisabled = () => {
        return (userbalance < lolValue || userbalance <= 0);
    }

    return (
        <ButtonBase onClick={() => {
            onclick(euroValue, lolValue)
        }} style={{marginTop: "16px", width: "100%"}} disabled={isDisabled()}>
            <Paper
                elevation={4}
                style={{
                    opacity: (isDisabled() ? 0.30 : 1.0),
                    backgroundColor: isDisabled() ? "#A0A0A0" : "#FFFFFF",
                    width: "100%"
                }}>
                <ListItem>
                    <ListItemIcon>
                        <img style={{maxHeight: "45px"}}
                             src="https://ipfs.funnychain.co/ipfs/QmNkWP19Dt4yPU2cc7efZKddDraRukwWDiwwP7D3mdUiUA"/>
                    </ListItemIcon>
                    <ListItemText
                        primary={euroValue + "$ Paypal Payout"}
                        secondary={lolValue.toFixed(0) + " LOL token"}
                    />
                </ListItem>
            </Paper>
        </ButtonBase>
    );
}

interface State {
    confirmeDialog: boolean,
    dialogEuroValue: number,
    dialogTokenValue: number,
}

export default class UserWalletPayout extends Component<{
    userid: string,
    paypallink: string,
    balance: number,
    clearPaypalmeLink: () => void,
    onUpdateBalance:()=>void,
}, State> {

    state: State = {
        confirmeDialog: false,
        dialogEuroValue: 0,
        dialogTokenValue: 0,
    };


    processPaypal(valueeuro: number, valuetoken: number) {
        walletService.payout({
            valueeuro: valueeuro,
            valuetoken: valuetoken,
            userid: this.props.userid,
            paypallink: this.props.paypallink
        }).then(value => {
            userNotificationService.sendNotificationToUser("Paypal transaction is being processed. You will receive an confirmation email when done");
            this.props.onUpdateBalance();
        }).catch(reason => {
            audit.error(reason);
            userNotificationService.sendNotificationToUser(reason);
        });
    }

    render() {
        return (
            <React.Fragment>
                <TextField
                    fullWidth
                    label="Paypal Account Used"
                    value={this.props.paypallink}
                    margin="normal"
                    variant="outlined"
                    disabled={true}
                />
                <Button fullWidth variant="contained" onClick={() => {
                    this.props.clearPaypalmeLink()
                }}>
                    Edit
                </Button>
                <br/>
                <br/>
                <Typography style={{color: "red"}}>
                    <b>The exchange rate may vary over time depending on the app audience and is not fixed. Ask on
                        discord for more information.</b>
                </Typography>
                <List component="nav">
                    {PaypalPayout(5, Math.floor(lolTokenService.convertEuroToLolValue(5)), this.props.balance, (euroValue: number, lolValue: number) => {
                        this.setState({
                            confirmeDialog: true,
                            dialogEuroValue: euroValue,
                            dialogTokenValue: lolValue,
                        });
                    })}
                    {PaypalPayout(10, Math.floor(lolTokenService.convertEuroToLolValue(10)), this.props.balance, (euroValue: number, lolValue: number) => {
                        this.setState({
                            confirmeDialog: true,
                            dialogEuroValue: euroValue,
                            dialogTokenValue: lolValue,
                        });
                    })}
                    {PaypalPayout(20, Math.floor(lolTokenService.convertEuroToLolValue(20)), this.props.balance, (euroValue: number, lolValue: number) => {
                        this.setState({
                            confirmeDialog: true,
                            dialogEuroValue: euroValue,
                            dialogTokenValue: lolValue,
                        });
                    })}
                    {PaypalPayout(50, Math.floor(lolTokenService.convertEuroToLolValue(50)), this.props.balance, (euroValue: number, lolValue: number) => {
                        this.setState({
                            confirmeDialog: true,
                            dialogEuroValue: euroValue,
                            dialogTokenValue: lolValue,
                        });
                    })}
                </List>

                <Dialog
                    open={this.state.confirmeDialog}
                    onClose={() => {
                        this.setState({confirmeDialog: false});
                    }}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Confirmation</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Please confirme the payout of {this.state.dialogEuroValue}€. This transaction will
                            consume {this.state.dialogTokenValue} LOL token.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                this.setState({confirmeDialog: false});
                            }}
                            color="primary">
                            Disagree
                        </Button>
                        <Button
                            onClick={() => {
                                this.setState({confirmeDialog: false});
                                this.processPaypal(this.state.dialogEuroValue, this.state.dialogTokenValue);
                            }}
                            color="primary" autoFocus>
                            Agree
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        )
    }
}
