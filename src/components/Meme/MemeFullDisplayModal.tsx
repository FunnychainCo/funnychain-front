import * as React from 'react'
import {Component} from 'react'
import {MemeLinkInterface} from "../../service/generic/ApplicationInterface";
import withStyles from "@material-ui/core/styles/withStyles";
import MemeFullDisplay from "./MemeFullDisplay";
import FullPageWithHeader from "../ModalPage/FullPageWithHeader";


const styles = theme => ({});

class MemeFullDisplayModal extends Component<{
    meme: MemeLinkInterface,
}, {}> {

    render() {
        //const {classes} = this.props;
        return <FullPageWithHeader>
            <MemeFullDisplay meme={this.props.meme}/>
        </FullPageWithHeader>
    }

}

export default withStyles(styles)(MemeFullDisplayModal);