import * as React from 'react';
import {Component} from 'react';
import Dialog from "@material-ui/core/Dialog/Dialog";
import withMobileDialog from "@material-ui/core/withMobileDialog/withMobileDialog";
import Header from "../Header/Header";

class ModalPageWithHeader extends Component<{
    title: string,
    open: boolean,
    onRequestClose: () => void
}, any> {
    render() {
        const {fullScreen}: any = this.props;
        return (
            <Dialog
                fullScreen={fullScreen}
                title={this.props.title}
                open={this.props.open}
                onClose={this.props.onRequestClose}
            >
                {fullScreen && <Header type={""} onTypeChange={(type) => {}}/>}
                <div>{/*add div to have the button right after the text field*/}
                    {this.props.children}
                </div>
            </Dialog>
        )
    }
}


export default withMobileDialog<any>()(ModalPageWithHeader);