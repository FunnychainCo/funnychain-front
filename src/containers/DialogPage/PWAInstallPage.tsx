import * as React from 'react'
import {Component} from 'react'
import {backService} from "../../service/BackService";
import PWAInstallDialog from "../../components/Install/PWAInstallDialog";

export default class PWAInstallPage extends Component<{
    match: any,
    history: any
}, { open: boolean }> {
    state = {
        open: true
    };

    goBack() {
        //window.history.back();
        //this.props.history.goBack();
        this.setState({open: false});//in case there is nothing to go back we close it anyway
        backService.goBack();
    }

    render() {
        return (<PWAInstallDialog open={this.state.open} handleClose={() => {
            this.goBack()
        }}/>)
    }
}
