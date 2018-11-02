import {Component} from 'react';
import * as React from 'react'
import {userNotificationService} from "../../service/UserNotificationService";
import {withStyles} from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const styles = theme => ({
    close: {
        padding: theme.spacing.unit / 2,
    },
});

interface IState {
    open: boolean,
    messageInfo: any
}

class GlobalNotification extends Component<{ classes: any }, IState> {

    state: IState = {
        open: false,
        messageInfo: {},
    };

    queue: any[] = [];

    processMessage(message) {
        this.queue.push({
            message,
            key: new Date().getTime(),
        });

        if (this.state.open) {
            // immediately begin dismissing current message
            // to start showing new one
            this.setState({open: false});
        } else {
            this.processQueue();
        }
    }

    processQueue = () => {
        if (this.queue.length > 0) {
            this.setState({
                messageInfo: this.queue.shift(),
                open: true,
            });
        }
    };

    handleClose = (reason: any) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({open: false});
    };

    handleExited = () => {
        this.processQueue();
    };

    componentWillMount() {
        userNotificationService.start((message) => {
            console.log("Notification: " + message);
            this.processMessage(message);
        });
    }

    componentWillUnmount() {
    }

    render() {
        const {classes} = this.props;
        const {message, key} = this.state.messageInfo;
        return (
            <Snackbar
                key={key}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={this.state.open}
                autoHideDuration={6000}
                onClose={this.handleClose}
                onExited={this.handleExited}
                ContentProps={{
                    'aria-describedby': 'message-id',
                }}
                message={<span id="message-id">{message}</span>}
                action={[
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
                ]}
            />
        );
    }
}

export default withStyles(styles)(GlobalNotification);