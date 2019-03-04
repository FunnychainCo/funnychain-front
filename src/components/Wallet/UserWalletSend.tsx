import * as React from 'react'
import {Component} from 'react'
import {USER_ENTRY_NO_VALUE, UserEntry} from "../../service/generic/UserEntry";
import {authService} from "../../service/generic/AuthService";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import {userService} from "../../service/generic/UserService";
import {userNotificationService} from "../../service/notification/UserNotificationService";
import LoadingBlock from "../LoadingBlock/LoadingBlock";
import CircularProgress from "@material-ui/core/CircularProgress";

interface State {
    user: UserEntry,
    loading: boolean,
    processing:boolean,
    sendTokenValid: boolean,
    value: number,
}

export default class UserWalletSend extends Component<{
    userid: string
}, State> {

    state: State = {
        user: USER_ENTRY_NO_VALUE,
        loading: true,
        processing:false,
        sendTokenValid: false,
        value: 0,
    };

    private removeListener: () => void = () => {
    };

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

    handleProcessTransaction = () => {
        this.setState({processing:true});
        console.log("send " + this.dialogAmount + " to " + this.dialogAddrDest);
        userService.transfer(this.dialogAddrDest, +this.dialogAmount).then(value => {
            userNotificationService.sendNotificationToUser("Transaction registered");
            this.setState({processing:false});
        }).catch(reason => {
            userNotificationService.sendNotificationToUser("An error has occurred with your transaction");
            this.setState({processing:false});
        });
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

    render() {
        return (
            <React.Fragment>
                {(!this.state.loading && !this.state.processing) &&
                < React.Fragment>
                    < TextField
                        variant="outlined"
                        type={"text"}
                        label={"your account address"}
                        value={this.state.user.uid}
                        fullWidth={true}/>
                    <br/><br/>
                    <TextField
                        variant="outlined"
                        onChange={(event) => {
                            this.dialogAddrDest = event.target.value;
                            this.checkValidity();
                        }}
                        type={"text"}
                        label={"destination account address"}
                        fullWidth={true}/>
                    <br/><br/>
                    <TextField
                        variant="outlined"
                        onChange={(event) => {
                            this.dialogAmount = event.target.value;
                            this.checkValidity();
                        }}
                        type={"number"}
                        label={"amount"}
                        fullWidth={true}/>
                    <br/><br/>
                    <Button
                        fullWidth
                        variant="contained"
                        color={"primary"}
                        onClick={this.handleProcessTransaction}
                        disabled={!this.state.sendTokenValid}
                    >Send</Button>
                </React.Fragment>
                }
                {this.state.loading &&
                <LoadingBlock/>
                }
                {this.state.processing &&
                <div style={{flexDirection:"column",display:"flex",justifyContent:"center ",alignItems:"center",height:"100px"}}>
                    <CircularProgress />
                    <div>Processing token transaction</div>
                </div>
                }
            </React.Fragment>
        )
    }
}
