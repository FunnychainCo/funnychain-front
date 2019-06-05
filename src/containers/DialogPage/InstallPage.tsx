import * as React from 'react'
import {Component} from 'react'
import InstallDialog from "../../components/Install/InstallDialog";
import {backService} from "../../service/BackService";

export default class InstallPage extends Component<{
    match: any,
    history: any
}, {open:boolean}> {
    state={
        open:true
    };
    goBack() {
        //window.history.back();
        //this.props.history.goBack();
        this.setState({open:false});//in case there is nothing to go back we close it anyway
        backService.goBack();
    }

    render() {
        return (<InstallDialog open={this.state.open} handleClose={()=>{this.goBack()}}/>)
    }
}
