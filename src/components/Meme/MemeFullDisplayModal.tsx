import {Component} from 'react'
import {
    MemeLinkInterface
} from "../../service/generic/ApplicationInterface";
import * as React from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import MemeFullDisplay from "./MemeFullDisplay";
import FullPageWithHeader from "../ModalPage/FullPageWithHeader";


const styles = theme => ({});

class MemeFullDisplayModal extends Component<{
    meme: MemeLinkInterface,
    classes: any,
    open: boolean,
    onRequestClose: () => void,
}, {}> {

    render() {
        //const {classes} = this.props;
        return <FullPageWithHeader title={this.props.meme.id} open={this.props.open}
                          onRequestClose={this.props.onRequestClose}>
            <MemeFullDisplay meme={this.props.meme}/>
        </FullPageWithHeader>
    }

}

export default withStyles(styles)(MemeFullDisplayModal);