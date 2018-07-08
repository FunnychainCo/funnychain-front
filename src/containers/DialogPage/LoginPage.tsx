import {Component} from 'react'
import * as React from 'react'
import LoginRegisterDialog from "../../components/LoginDialog/LoginRegisterDialog";

export default class LoginPage extends Component<{
    match: any,
    history: any
}, void> {

    goBack() {
        //window.history.back();
        this.props.history.goBack();
    }

    render() {
        return (<LoginRegisterDialog open={true} onRequestClose={()=>{this.goBack()}}/>)
    }
}
