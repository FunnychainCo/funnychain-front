import * as React from 'react'
import {Component} from 'react'
import ListItemText from "@material-ui/core/ListItemText";
import {USER_ENTRY_NO_VALUE, UserEntry} from "../../service/generic/UserEntry";
import {authService} from "../../service/generic/AuthService";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import ModalPage from "../ModalPage/ModalPage";
import Button from "@material-ui/core/Button";
import {userService} from "../../service/generic/UserService";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import DialogActions from "@material-ui/core/DialogActions";
import {CashRefund, TransitConnectionVariant, History} from 'mdi-material-ui'; //https://materialdesignicons.com/
import SwipeableViews from 'react-swipeable-views';
import Typography from "@material-ui/core/Typography";
import LolTokenIcon from "../Icon/LolTokenIcon";
import BackButton from "../Header/BackButton";
import Toolbar from "@material-ui/core/Toolbar";
import UserWalletSend from "./UserWalletSend";
import UserWalletTransaction from "./UserWalletTransaction";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Paper from "@material-ui/core/Paper";
import {userNotificationService} from "../../service/notification/UserNotificationService";
import {lolTokenService} from "../../service/generic/LolTokenService";

function TabContainer({children}) {
    return (
        <Typography component="div" style={{padding: 8 * 3}}>
            {children}
        </Typography>
    );
}

function PaypalPayout(euroValue:number, lolValue:number, onclick:()=>void) {
    return (
        <Paper style={{marginTop:"16px"}} onClick={onclick}>
            <ListItem>
                <ListItemIcon>
                    <img style={{maxHeight: "45px"}}
                         src="https://ipfs.funnychain.co/ipfs/QmNkWP19Dt4yPU2cc7efZKddDraRukwWDiwwP7D3mdUiUA"/>
                </ListItemIcon>
                <ListItemText
                    primary={euroValue+"$ Paypal Payout"}
                    secondary={lolValue.toFixed(0)+" LOL token"}
                />
            </ListItem>
        </Paper>
    );
}

interface State {
    user: UserEntry,
    loading: boolean,
    displayTransaction: boolean,
    value: number,
}

export default class UserWallet extends Component<{
    onRequestClose: () => void,
    open: boolean,
}, State> {

    handleClose = () => {
        this.props.onRequestClose();
    };

    state: State = {
        user: USER_ENTRY_NO_VALUE,
        loading: true,
        displayTransaction: false,
        value: 0,
    };

    private removeListener: () => void = () => {
    };

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

    changePage(index) {
        if (index === 2) {
            this.setState({displayTransaction: true});
        } else {
            this.setState({displayTransaction: false});
        }
        this.setState({value: index});

    }

    handleChange = (event, value) => {
        this.changePage(value);
    };

    handleChangeIndex = (index) => {
        this.changePage(index);
    };

    processPaypal(){
        userNotificationService.sendNotificationToUser("Paypal Payout not yet available. Subscribe to the newsletter at https://funnychain.co to get notified when this service is available.")
    }

    render() {
        return (
            <ModalPage
                open={this.props.open}
                onRequestClose={this.handleClose}
            >
                <DialogTitle>
                        <Toolbar>
                            <BackButton/>
                            <Typography color="inherit" variant="h6"
                                        style={{flex: "1", textAlign: "center"}}>Wallet</Typography>
                            <Button style={{pointerEvents:"none"}} color="inherit" variant={"outlined"}><LolTokenIcon/><ListItemText
                                primary={<React.Fragment>{(this.state.user.wallet).toFixed(2) + ""}</React.Fragment>}/></Button>
                        </Toolbar>
                </DialogTitle>
                <DialogContent>
                    <SwipeableViews
                        index={this.state.value}
                        onChangeIndex={this.handleChangeIndex}
                    >
                        <TabContainer>
                            <List component="nav">
                                {PaypalPayout(5,lolTokenService.convertEuroToLolValue(5),()=>{this.processPaypal()})}
                                {PaypalPayout(10,lolTokenService.convertEuroToLolValue(10),()=>{this.processPaypal()})}
                                {PaypalPayout(20,lolTokenService.convertEuroToLolValue(20),()=>{this.processPaypal()})}
                                {PaypalPayout(50,lolTokenService.convertEuroToLolValue(50),()=>{this.processPaypal()})}
                            </List>
                        </TabContainer>
                        <TabContainer>
                            <UserWalletSend userid={this.state.user.uid}/>
                        </TabContainer>
                        <TabContainer>
                            {this.state.displayTransaction &&
                            <UserWalletTransaction userid={this.state.user.uid}/>}
                        </TabContainer>
                    </SwipeableViews>
                </DialogContent>
                <DialogActions>
                    <Tabs
                        style={{width: "100%"}}
                        value={this.state.value}
                        onChange={this.handleChange}
                        variant="fullWidth"
                        indicatorColor="secondary"
                        textColor="secondary"
                    >
                        <Tab icon={<CashRefund/>} label="Payout"/>
                        <Tab icon={<TransitConnectionVariant/>} label="Send"/>
                        <Tab icon={<History/>} label="History"/>
                    </Tabs>
                </DialogActions>
            </ModalPage>
        )
    }
}
