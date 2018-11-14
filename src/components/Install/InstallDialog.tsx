import {Component} from 'react'
import * as React from 'react'
import ModalPage from "../ModalPage/ModalPage";
import Button from "@material-ui/core/Button/Button";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import {withStyles} from '@material-ui/core/styles';
import BrowserNotCompatible from "./BrowserNotCompatible";
import AndroidInstall from "./AndroidInstall";
import IOSInstall from "./IOSInstall";
const styles: any = theme => ({});

class InstallDialog extends Component<{
    classes: any
    open: boolean,
    handleClose: () => void
}, { }> {

    state = { };

    componentWillMount() {
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <ModalPage
                open={this.props.open}
                onClose={this.props.handleClose}
            >
                <DialogTitle>Install</DialogTitle>
                <DialogContent style={{display: "flex",flexDirection:"row",margin:0,padding:0}}>
                    <div style={{flexGrow:1,display: "flex",flexDirection:"column"}}>
                        {false&&<BrowserNotCompatible />}
                        {false&&<AndroidInstall />}
                        {true&&<IOSInstall />}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.props.handleClose}>Back</Button>
                </DialogActions>
            </ModalPage>
        )
    }
}

export default withStyles(styles)(InstallDialog);