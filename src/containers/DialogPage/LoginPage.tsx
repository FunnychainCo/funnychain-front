import * as React from 'react'
import {Component} from 'react'
import LoginRegisterDialogV2 from "../../components/LoginDialog/LoginRegisterDialogV2";
import {backService} from "../../service/BackService";

export default class LoginPage extends Component<{
    match: any,
    history: any
}, {}> {

    goBack() {
        //window.history.back();
        //this.props.history.goBack();
        backService.goBack();
    }

    render() {
        return (<LoginRegisterDialogV2 open={true} onRequestClose={()=>{this.goBack()}}/>)
    }
}
