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

interface State {
}

function PaypalPayout(euroValue: number, lolValue: number, onclick: () => void) {
    return (
        <Paper style={{marginTop: "16px"}} onClick={onclick}>
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
    );
}

export default class UserWalletPayout extends Component<{
    userid: string
}, State> {

    state: State = {};


    processPaypal() {
        userNotificationService.sendNotificationToUser("Paypal Payout not yet available. Subscribe to the newsletter at https://funnychain.co to get notified when this service is available or ask us on discord for more information!")
    }

    render() {
        return (
            <React.Fragment>
                <Typography style={{color:"red"}}>
                    <b>The exchange rate may vary over time depending on the app audience and is not fixed. Ask on discord for more information.</b>
                </Typography>
                <List component="nav">
                    {PaypalPayout(5, lolTokenService.convertEuroToLolValue(5), () => {
                        this.processPaypal()
                    })}
                    {PaypalPayout(10, lolTokenService.convertEuroToLolValue(10), () => {
                        this.processPaypal()
                    })}
                    {PaypalPayout(20, lolTokenService.convertEuroToLolValue(20), () => {
                        this.processPaypal()
                    })}
                    {PaypalPayout(50, lolTokenService.convertEuroToLolValue(50), () => {
                        this.processPaypal()
                    })}
                </List>
            </React.Fragment>
        )
    }
}
