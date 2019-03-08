import * as React from 'react';
import {Component} from 'react';
import {authService} from "../../service/generic/AuthService";
import {USER_ENTRY_NO_VALUE, UserEntry} from "../../service/generic/UserEntry";
import Logged from "./Logged";
import NotLogged from "./NotLogged";
import {Link} from 'react-router-dom'
import AccountDrawer from "../Account/AccountDrawer";
import LoginRegisterDialogV2 from "../LoginDialog/LoginRegisterDialogV2";
import {backService} from "../../service/BackService";
import WalletIcon from "../Icon/WalletIcon";
import IconButton from "@material-ui/core/IconButton";

interface State {
    user: UserEntry,
    dialogLogin: boolean,
    drawerOpen: boolean,
}

export default class LoginAccountIcon extends Component<{}, State> {
    state: State = {
        user: USER_ENTRY_NO_VALUE,
        dialogLogin: false,
        drawerOpen: false,
    };
    private removeListener: () => void = ()=>{};
    private removeBackListener: () => void = ()=>{};

    componentDidMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            this.setState({user: user});
        })

        this.removeBackListener = backService.onBack(() => {
            this.setState({drawerOpen:false});
            this.setState({dialogLogin:false});
        })
    }

    componentWillUnmount() {
        this.removeListener();
        this.removeBackListener();
    }

    openDialogLogin = () => {
        this.setState({dialogLogin: true});
    };

    render() {

        const AccountLink = (props:any) => <Link color="inherit" to={"/account"} {...props} />;
        const LogLink = (props:any) => <Link color="inherit" to={"/log"} {...props} />;
        const walletLink = (props:any) => <Link to={"/user/current/wallet"} {...props} />;
        const LoggedButton =
        <React.Fragment>
            <IconButton component={walletLink}>
                <WalletIcon/>
            </IconButton>
            &nbsp;&nbsp;
            <Logged
                component={AccountLink}
                onAccountClick={() => {
                this.setState({drawerOpen:true});
            }}/>
        </React.Fragment>;
       const NotLoggedButton =
                <NotLogged
                    component={LogLink}
                    onDialogLogin={() => {
                    this.setState({dialogLogin:true});
                }}/>;
        return (
            <React.Fragment>
                {(this.state.user !== USER_ENTRY_NO_VALUE ? true : false) ?
                    LoggedButton : NotLoggedButton}
                <AccountDrawer open={this.state.drawerOpen} onRequestChange={()=>{backService.goBack()}}/>
                <LoginRegisterDialogV2 open={this.state.dialogLogin} onRequestClose={()=>{backService.goBack()}}/>
            </React.Fragment>)
    }
}