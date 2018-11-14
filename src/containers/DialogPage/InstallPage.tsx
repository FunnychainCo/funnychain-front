import {Component} from 'react'
import * as React from 'react'
import InstallDialog from "../../components/Install/InstallDialog";

export default class InstallPage extends Component<{
    match: any,
    history: any
}, {open:boolean}> {
    state={
        open:true
    };
    goBack() {
        //window.history.back();
        this.setState({open:false});//in case there is nothing to go back we close it anyway
        this.props.history.goBack();
    }

    render() {
        return (<InstallDialog open={this.state.open} handleClose={()=>{this.goBack()}}/>)
    }
}
