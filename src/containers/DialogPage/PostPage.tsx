import * as React from 'react'
import {Component} from 'react'
import CreateMemeDialog from "../../components/CreateMemeDialogFab/CreateMemeDialog";
import {backService} from "../../service/BackService";

export default class PostPage extends Component<{
    match: any,
    history: any
}, {}> {

    goBack() {
        //window.history.back();
        //this.props.history.goBack();
        backService.goBack();
    }

    render() {
        return (<CreateMemeDialog open={true} handleClose={()=>{this.goBack()}}/>)
    }
}
