import React, {Component} from 'react';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';
import {leftMenuService} from "../../service/LeftMenuService";
import {authService} from "../../service/AuthService";
import LoginDialog from "../LoginDialog/LoginDialog";
import RegisterDialog from "../RegisterDialog/RegisterDialog";
import Logged from "./Logged";
import NotLogged from "./NotLogged";
import AccountDrawer from "../Account/AccountDrawer";
import {Toolbar} from "material-ui";
import {Typography} from "material-ui";
import {withStyles} from "material-ui";

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

class Header extends Component {
    state = {
        logged: false,
        dialogLogin: false,
        dialogRegister: false,
        drawerOpen:false
    }

    componentDidMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            this.setState({
                logged: user ? true : false
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
                <LoginDialog open={this.state.dialogLogin} onRequestClose={() => this.setState({dialogLogin: false})}/>
                <RegisterDialog open={this.state.dialogRegister}
                                onRequestClose={() => this.setState({dialogRegister: false})}/>
                <AccountDrawer open={this.state.drawerOpen}
                               onRequestChange={(open)=>{this.setState({drawerOpen:open})}}/>
            </AppBar>
        )
    }
}

Header.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Header);