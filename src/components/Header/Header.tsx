import {Component} from 'react';
import * as React from 'react';
import {leftMenuService} from "../../service/LeftMenuService";
import {authService, USER_ENTRY_NO_VALUE} from "../../service/generic/AuthService";
import RegisterDialog from "../RegisterDialog/RegisterDialog";
import Logged from "./Logged";
import NotLogged from "./NotLogged";
import AccountDrawer from "../Account/AccountDrawer";
import SteemLoginDialog from "../SteemLoginDialog/SteemLoginDialog";
import AppBar from "@material-ui/core/AppBar/AppBar";
import Typography from "@material-ui/core/Typography/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import Toolbar from "@material-ui/core/Toolbar/Toolbar";

const styles = {
    root: {
        flexGrow: 1,
    },
    flex: {
        flex: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
};

class Header extends Component<any,any> {
    state = {
        logged: false,
        dialogLogin: false,
        dialogRegister: false,
        drawerOpen:false
    }
    private removeListener: () => void;

    componentDidMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            this.setState({
                logged: user!=USER_ENTRY_NO_VALUE ? true : false
            });
        })
    }

    componentWillUnmount() {
        this.removeListener();
    }

    onLeftIconButtonClick() {
        leftMenuService.requestOpening();
    }

    openDialogLogin = () => {
        this.setState({dialogLogin: true});
    }

    openDialogRegister = () => {
        this.setState({dialogRegister: true});
    }

    render() {
        const { classes } = this.props;
        return (
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="title" color="inherit" className={classes.flex}>
                        FunnyChain
                    </Typography>
                    <div>
                    {this.state.logged ?
                        <Logged onAccountClick={()=>{this.setState({drawerOpen:true})}}/> :
                        <NotLogged
                            onDialogLogin={this.openDialogLogin}
                            onDialogRegister={this.openDialogRegister}
                        />}
                    </div>
                </Toolbar>
                <SteemLoginDialog open={this.state.dialogLogin} onRequestClose={() => this.setState({dialogLogin: false})}/>
                <RegisterDialog open={this.state.dialogRegister}
                                onRequestClose={() => this.setState({dialogRegister: false})}/>
                <AccountDrawer open={this.state.drawerOpen}
                               onRequestChange={(open)=>{this.setState({drawerOpen:open})}}/>
            </AppBar>
        )
    }
}

export default withStyles(styles)(Header);