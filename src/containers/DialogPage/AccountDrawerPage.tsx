import * as React from 'react'
import {Component} from 'react'
import AccountDrawer from "../../components/Account/AccountDrawer";

export default class AccountDrawerPage extends Component<{
    match: any,
    history: any
}, void> {

    goBack() {
        //window.history.back();
        this.props.history.goBack();
    }

    render() {
        return (<AccountDrawer open={true} onRequestChange={()=>{this.goBack()}}/>)
    }
}
