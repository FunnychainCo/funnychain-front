import * as React from 'react'
import {Component} from 'react'
import CreateMemeDialog from "../../components/CreateMemeDialogFab/CreateMemeDialog";

export default class PostPage extends Component<{
    match: any,
    history: any
}, void> {

    goBack() {
        //window.history.back();
        this.props.history.goBack();
    }

    render() {
        return (<CreateMemeDialog open={true} handleClose={()=>{this.goBack()}}/>)
    }
}
