import * as React from 'react'
import {Component} from 'react'
import AccountDrawer from "../../components/Account/AccountDrawer";
import {backService} from "../../service/BackService";

export default class AccountDrawerPage extends Component<{
    match: any,
    history: any
}, {}> {

    goBack() {
        //window.history.back();
        //this.props.history.goBack();
        backService.goBack();
    }

    render() {
        return (<AccountDrawer open={true} onRequestChange={()=>{this.goBack()}}/>)
    }
}
