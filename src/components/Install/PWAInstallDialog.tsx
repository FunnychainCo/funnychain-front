import * as React from 'react'
import {Component} from 'react'
import ModalPage from "../ModalPage/ModalPage";
import Button from "@material-ui/core/Button/Button";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import {withStyles} from '@material-ui/core/styles';
import AndroidInstall from "./AndroidInstall";
import IOSInstall from "./IOSInstall";
import MobileDetect from "mobile-detect";
import BrowserNotCompatible from "./BrowserNotCompatible";

const styles: any = theme => ({});

declare let window: any;

class PWAInstallDialog extends Component<{
    classes: any
    open: boolean,
    handleClose: () => void
}, {}> {

    state = {};

    ios = false;
    android = false;

    componentWillMount() {
        let md = new MobileDetect(window.navigator.userAgent);
        this.ios = md.is('iOS');
        this.android = md.is('AndroidOS');
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <ModalPage
                open={this.props.open}
                onRequestClose={this.props.handleClose}
            >
                <DialogTitle>Install</DialogTitle>
                <DialogContent style={{display: "flex", flexDirection: "row", margin: 0, padding: 0}}>
                    <div style={{flexGrow: 1, display: "flex", flexDirection: "column", minWidth: "200px"}}>
                        {(!this.ios && !this.android) && <BrowserNotCompatible/>}
                        {this.android && <AndroidInstall/>}
                        {this.ios && <IOSInstall/>}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.props.handleClose}>Back</Button>
                </DialogActions>
            </ModalPage>
        )
    }
}

export default withStyles(styles)(PWAInstallDialog);