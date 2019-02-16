import * as React from 'react'
import {Component} from 'react'
import Button from "@material-ui/core/Button/Button";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import {withStyles} from '@material-ui/core/styles';
import Dialog from "@material-ui/core/Dialog";
import store from 'store';
import AboutUsDialog from "./AboutUsDialog";
import {EmoticonCool} from 'mdi-material-ui';
import InstallButton from "./InstallButtons";

const styles: any = theme => ({});

class StartPopupSkipDialog extends Component<{
    classes: any
}, {
    open: boolean,
    aboutUsOpen:boolean
}> {

    state = {
        open: false,
        aboutUsOpen:false
    };

    componentWillMount() {
        let skiped = store.get("fc.pwa.install.skipped") || false;
        let displayPopup = !skiped;
        this.setState({open: displayPopup});
    }


    skip() {
        this.doNotShowPopupAgain();
        this.handleClose();
    }

    doNotShowPopupAgain() {
        store.set("fc.pwa.install.skipped", true);
    }

    handleClose() {
        this.setState({open: false});
    }

    render() {
        return (
            <Dialog
                open={this.state.open}
                onClose={() => {
                    this.handleClose()
                }}
            >
                <DialogTitle>Welcome to Funnychain</DialogTitle>
                <DialogContent>
                    <Button
                        style={{fontSize:"0.8em",marginBottom:"8px"}}
                        onClick={() => {
                            this.setState({aboutUsOpen: true})
                        }}
                        variant="contained"
                        fullWidth
                    ><EmoticonCool/>&nbsp;&nbsp;About Funnychain
                    <AboutUsDialog onRequestClose={() => {
                        this.handleClose()
                    }} open={this.state.aboutUsOpen} />
                    </Button>
                    <InstallButton/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        this.skip()
                    }}>Skip</Button>
                </DialogActions>
            </Dialog>
        )
    }
}

export default withStyles(styles)(StartPopupSkipDialog);