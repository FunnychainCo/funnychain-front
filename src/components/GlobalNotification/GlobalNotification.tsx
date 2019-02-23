import * as React from 'react';
import {Component} from 'react';
import {Message, userNotificationService} from "../../service/notification/UserNotificationService";
import {withStyles} from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Button from "@material-ui/core/Button";
import {updateService} from "../../service/UpdateService";

const styles = theme => ({
    close: {
        padding: theme.spacing.unit / 2,
    },
});

interface IState {
    open: boolean,
    messageInfo: Message
}

class GlobalNotification extends Component<{ classes: any }, IState> {

    state: IState = {
        open: false,
        messageInfo: {
            text: "",
            type: "text",
            date: 0
        },
    };

    queue: Message[] = [];

    processMessage(message: Message) {
        this.queue.push(message);
        this.displayMessage(message);
    }

    displayMessage(message) {
        this.setState({open: false});
        setTimeout(() => {
            this.setState({
                messageInfo: message,
                open: true,
            });
        }, 400);
    }

    displayNextMessage() {
        if (this.queue.length > 0) {
            let message = this.queue[this.queue.length - 1];
            this.displayMessage(message);
        }
    };

    handleClose = (reason: any) => {
        this.setState({open: false});
        this.queue.pop();
        this.displayNextMessage();
    };

    handleExited = () => {
    };

    componentWillMount() {
        userNotificationService.setUiCallBackForNotification((message: Message) => {
            this.processMessage(message);
        });
        /*this.processMessage({
            text:"New Update available!",
            type:"update",
            date:new Date().getTime(),
        });*/
    }

    componentWillUnmount() {
    }

    render() {
        const {classes} = this.props;
        let typeAction = {};
        typeAction["text"] = [
            <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                className={classes.close}
                onClick={(reason) => {
                    this.handleClose(reason)
                }}
            >
                <CloseIcon/>
            </IconButton>,
        ];

        typeAction["update"] = [
            <Button key="update" size="small"
                    color="inherit"
                    onClick={(reason) => {
                        updateService.performUpdate();
                        this.handleClose(reason)
                    }} >
                Update
            </Button>,
            <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                className={classes.close}
                onClick={(reason) => {
                    this.handleClose(reason)
                }}
            >
                <CloseIcon/>
            </IconButton>
        ];

        return (
            <Snackbar
                key={this.state.messageInfo.date}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={this.state.open}
                autoHideDuration={undefined}
                onClose={this.handleClose}
                onExited={this.handleExited}
                ContentProps={{
                    'aria-describedby': 'message-id',
                }}
                message={<span id="message-id">{this.state.messageInfo.text}</span>}
                action={typeAction[this.state.messageInfo.type]}
            />
        );
    }
}

export default withStyles(styles)(GlobalNotification);