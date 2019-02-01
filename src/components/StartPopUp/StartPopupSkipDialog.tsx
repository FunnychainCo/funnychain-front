import * as React from 'react'
import {Component} from 'react'
import Button from "@material-ui/core/Button/Button";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import {withStyles} from '@material-ui/core/styles';
import {pwaService} from "../../service/mobile/PWAService";
import Dialog from "@material-ui/core/Dialog";
import {Link} from 'react-router-dom';
import {CellphoneArrowDown} from 'mdi-material-ui'; //https://materialdesignicons.com/
import store from 'store';
import AboutUsDialog from "./AboutUsDialog";
import {EmoticonCool} from 'mdi-material-ui';

const styles: any = theme => ({});

class StartPopupSkipDialog extends Component<{
    classes: any
}, {
    displayAddToHomeButton: boolean,
    open: boolean,
    aboutUsOpen:boolean
}> {

    state = {
        displayAddToHomeButton: false,
        open: false,
        aboutUsOpen:false
    };
    private removeListenerPWA: () => void;

    componentWillMount() {
        let skiped = store.get("fc.pwa.install.skipped") || false;
        let displayPopup = !skiped && !pwaService.runningFromPWA;
        this.setState({open: displayPopup});
        this.removeListenerPWA = pwaService.on((callback) => {
            this.setState({displayAddToHomeButton: callback == null ? false : true});
        });
    }

    componentWillUnmount() {
        this.removeListenerPWA();
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
        const installLink = (props) => <Link to={"/install"} {...props} />;
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
                    {this.state.displayAddToHomeButton &&
                    <Button
                        style={{fontSize:"0.8em",marginBottom:"8px"}}
                        onClick={() => {
                            this.doNotShowPopupAgain();
                            pwaService.triggerAddToHomeScreen();
                        }} variant="contained" fullWidth>
                        <CellphoneArrowDown/>&nbsp;&nbsp;Add to Home Screen
                    </Button>
                    }
                    {!this.state.displayAddToHomeButton &&
                    <Button
                        style={{fontSize:"0.8em",marginBottom:"8px"}}
                        onClick={() => {
                            this.doNotShowPopupAgain();
                            pwaService.triggerAddToHomeScreen();
                        }}
                        component={installLink} variant="contained" fullWidth>
                        <CellphoneArrowDown/>&nbsp;&nbsp;Install to Home Screen
                    </Button>
                    }
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