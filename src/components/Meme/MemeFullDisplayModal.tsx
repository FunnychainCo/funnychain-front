import {Component} from 'react'
import "./Meme.css"
import {
    MemeLinkInterface
} from "../../service/generic/ApplicationInterface";
import * as React from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import ModalPage from "../ModalPage/ModalPage";
import MemeFullDisplay from "./MemeFullDisplay";


const styles = theme => ({
    actions: {
        display: 'flex',
    },
    expand: {
        transform: 'rotate(0deg)',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    }
});

class MemeFullDisplayModal extends Component<{
    meme: MemeLinkInterface,
    classes: any,
    open: boolean,
    onRequestClose: () => void,
}, {}> {

    render() {
        //const {classes} = this.props;
        return <ModalPage title={this.props.meme.id} open={this.props.open}
                          onRequestClose={this.props.onRequestClose}>
            <MemeFullDisplay meme={this.props.meme}/>
        </ModalPage>
    }

}

export default withStyles(styles)(MemeFullDisplayModal);