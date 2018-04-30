import React, {Component} from 'react';
import AppBar from 'material-ui/AppBar';
import {leftMenuService} from "../../service/LeftMenuService";
import {FlatButton, IconButton, IconMenu, MenuItem} from "material-ui";
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import {authService} from "../../service/AuthService";
import {firebaseAuthService} from "../../service/FirebaseAuthService";
import LoginDialog from "../LoginDialog/LoginDialog";
import RegisterDialog from "../RegisterDialog/RegisterDialog";

class NotLogged extends Component {
    render() {
        return (
            <IconMenu
                iconButtonElement={
                    <IconButton><MoreVertIcon /></IconButton>
                }
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            >
                <MenuItem primaryText="Login" onClick={() =>{this.props.onDialogLogin();}}/>
                <MenuItem primaryText="Register" onClick={()=>{this.props.onDialogRegister();}}/>
            </IconMenu>
        )
    }
}

class Logged extends Component {
    render () {
        return (
            <FlatButton {...this.props} label="Logout" onClick={() => {authService.logout()}} />
        );
    }
}

export default class Header extends Component {
    state = {
        logged: false,
        dialogLogin:false,
        dialogRegister:false
    }
    componentDidMount () {
        this.removeListener = firebaseAuthService.firebaseAuth().onAuthStateChanged((user) => {
            this.setState({
                logged: user?true:false
            });
        })
    }

    componentWillUnmount () {
        this.removeListener();
    }

    onLeftIconButtonClick(){
        leftMenuService.requestOpening();
    }

    openDialogLogin = () => {
        this.setState({dialogLogin:true});
    }

    openDialogRegister = () => {
        this.setState({dialogRegister:true});
    }

    render () {
        return (
            <div>
                <AppBar
                    title="FunnyChain"
                    showMenuIconButton={false}
                    onLeftIconButtonClick={this.onLeftIconButtonClick}
                    iconElementRight={this.state.logged ?
                        <Logged /> :
                        <NotLogged
                            onDialogLogin={this.openDialogLogin}
                            onDialogRegister={this.openDialogRegister}
                        />}
                />
                <LoginDialog open={this.state.dialogLogin} onRequestClose={() => this.setState({dialogLogin:false})}/>
                <RegisterDialog open={this.state.dialogRegister} onRequestClose={() => this.setState({dialogRegister:false})}/>
            </div>
        )
    }
}