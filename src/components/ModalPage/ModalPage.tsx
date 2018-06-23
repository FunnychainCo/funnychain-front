import {Component} from 'react';
import * as React  from 'react';
import "./ModalPage.css";
import Dialog from "@material-ui/core/Dialog/Dialog";
import withMobileDialog from "@material-ui/core/withMobileDialog/withMobileDialog";

class ModalPage extends Component<any,any> {
    render() {
        const { fullScreen }:any = this.props;
        return (
            <Dialog
                fullScreen={fullScreen}
                title={this.props.title}
                open={this.props.open}
                onClose={this.props.onRequestClose}
            >
                <div>{/*add div to have the button right after the text field*/}
                {this.props.children}
                </div>
            </Dialog>
        )
    }
}


export default withMobileDialog<any>()(ModalPage);