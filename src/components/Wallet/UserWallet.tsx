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
import BackButton from "../Header/BackButton";
import Toolbar from "@material-ui/core/Toolbar";
import UserWalletSend from "./UserWalletSend";
import UserWalletTransaction from "./UserWalletTransaction";
import MoneyCoinIcon from "../Icon/MoneyCoinIcon";
import UserWalletPayout from "./UserWalletPayout";
import UserPaypalMeLink from "./UserPaypalMeLink";

function TabContainer({children}) {
    return (
        <Typography component="div" style={{padding: 8 * 3}}>
            {children}
        </Typography>
    );
}

interface State {
    user: UserEntry,
    loading: boolean,
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
        value: 0,
    };

    private removeListener: () => void = () => {
    };
    private removeListenerWallet: () => void = () => {
    };

    componentWillMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            if (user == USER_ENTRY_NO_VALUE) {
                this.setState({
                    loading: true
                });
            } else {
                this.setState({
                    user: user,
                    loading: false
                });
                this.removeListenerWallet = userService.getWalletLink().onChange(balance => {
                    this.setState((state) => {
                        state.user.wallet = balance;
                        return {user: state.user}
                    });
                });
            }
        });
    }

    componentWillUnmount() {
        this.removeListener();
        this.removeListenerWallet();
    }

    changePage(index) {
        this.setState({value: index});

    }

    handleChange = (event, value) => {
        this.changePage(value);
    };

    handleChangeIndex = (index) => {
        this.changePage(index);
    };

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
                        <Button style={{pointerEvents: "none"}} color="inherit"
                                variant={"outlined"}><MoneyCoinIcon/><ListItemText
                            primary={
                                <React.Fragment>{(this.state.user.wallet).toFixed(2) + ""}</React.Fragment>}/></Button>
                    </Toolbar>
                </DialogTitle>
                <DialogContent>
                    <SwipeableViews
                        index={this.state.value}
                        onChangeIndex={this.handleChangeIndex}
                    >
                        <TabContainer>
                            {this.state.value == 0 &&
                            <React.Fragment>
                                {(this.state.user.metadata && this.state.user.metadata['paypalmelink']) &&
                                <UserWalletPayout
                                    userid={this.state.user.uid}
                                    paypallink={this.state.user.metadata['paypalmelink']}
                                    balance={this.state.user.wallet}
                                    clearPaypalmeLink={() => {
                                        this.setState((state) => {
                                            delete state.user.metadata['paypalmelink'];
                                            return {
                                                user: state.user
                                            }
                                        });
                                    }
                                    }
                                    onUpdateBalance={() => {
                                        userService.getWalletLink().refresh()
                                    }}
                                />
                                }
                                {(!this.state.user.metadata || !this.state.user.metadata['paypalmelink']) &&
                                <UserPaypalMeLink userid={this.state.user.uid}/>
                                }
                            </React.Fragment>
                            }
                        </TabContainer>
                        <TabContainer>
                            {this.state.value == 1 &&
                            <UserWalletSend userid={this.state.user.uid}/>
                            }
                        </TabContainer>
                        <TabContainer>
                            {this.state.value == 2 &&
                            <UserWalletTransaction userid={this.state.user.uid}/>
                            }
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
