import {Component} from 'react'
import * as React from 'react'
import LoginRegisterDialogV2 from "../../components/LoginDialog/LoginRegisterDialogV2";

export default class LoginPage extends Component<{
    match: any,
    history: any
}, void> {

    goBack() {
        //window.history.back();
        this.props.history.goBack();
    }

    render() {
        return (<LoginRegisterDialogV2 open={true} onRequestClose={()=>{this.goBack()}}/>)
    }
}
