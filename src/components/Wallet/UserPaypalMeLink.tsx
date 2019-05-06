import * as React from 'react'
import {Component} from 'react'
import Button from "@material-ui/core/Button/Button";
import {authService} from "../../service/generic/AuthService";
import {userNotificationService} from "../../service/notification/UserNotificationService";
import TextField from "@material-ui/core/TextField/TextField";
import Typography from "@material-ui/core/Typography/Typography";
import ExternalLink from "../Link/ExternalLink";

interface State {
    paypalmelink: string,
}


export default class UserPaypalMeLink extends Component<{
    userid: string
}, State> {

    state: State = {
        paypalmelink: null,
    };

    handleChange = (event) => {
        this.setState({paypalmelink: event.target.value});
    };

    process() {
        let link = this.state.paypalmelink;
        if (link.startsWith("paypal.me/")) {
            link = "https://" + link;
        }
        authService.setUserMetadata("paypalmelink", link);
        userNotificationService.sendNotificationToUser("Paypal Me Link Saved :)");
    }

    getErrorMessage(): string {
        let paypalmelink = this.state.paypalmelink;
        let ok = paypalmelink && paypalmelink != "" && (paypalmelink.startsWith("paypal.me/") || paypalmelink.startsWith("https://paypal.me/"));
        return !ok ? "Field Must be present and start with \"paypal.me/\"" : "";
    }

    render() {
        return (
            <React.Fragment>
                <Typography variant="h6">
                    Please enter your Paypal Me Link in order to redeem your payout.<br/>
                    <ExternalLink href="https://www.paypal.me/">Click Here</ExternalLink> to create a paypal me link and
                    past it in the field below.
                </Typography>
                <br/>
                <TextField error={(this.getErrorMessage() !== "" && this.state.paypalmelink !== null)}
                           fullWidth
                           value={this.state.paypalmelink || ""}
                           label={"Paypal.me Link"}
                           onChange={(event) => {
                               this.handleChange(event)
                           }}
                           margin="normal"
                           helperText={this.state.paypalmelink !== null ? this.getErrorMessage() : false}
                           variant="outlined"
                />
                <br/>
                <Button
                    disabled={(this.getErrorMessage() !== "" || this.state.paypalmelink === null)}
                    fullWidth
                    onClick={() => this.process()}>
                    Apply
                </Button>
            </React.Fragment>
        )
    }
}
