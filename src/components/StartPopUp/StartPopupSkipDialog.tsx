import * as React from 'react'
import {Component} from 'react'
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import {withStyles} from '@material-ui/core/styles';
import store from 'store';
import ModalPage from "../ModalPage/ModalPage";
import Fab from "@material-ui/core/Fab";
import {Check} from 'mdi-material-ui';
import Typography from "@material-ui/core/Typography";
import FirstPresentation from "./FirstPresentation"; //https://materialdesignicons.com/

const styles: any = theme => ({});

class StartPopupSkipDialog extends Component<{
    classes: any
}, {
    open: boolean
}> {

    state = {
        open: false
    };

    skipPopupStoreKey = "fc.terms.privacy.agreed";

    componentWillMount() {
        let skiped = store.get(this.skipPopupStoreKey,false);
        let displayPopup = !skiped;
        this.setState({open: displayPopup});
    }


    skip() {
        this.doNotShowPopupAgain();
        this.handleClose();
    }

    doNotShowPopupAgain() {
        store.set(this.skipPopupStoreKey, true);
    }

    handleClose() {
        this.setState({open: false});
    }

    render() {
        return (
            <ModalPage
                open={this.state.open}
                onClose={() => {
                    this.handleClose()
                }}
            >
                <DialogTitle>Welcome to Funnychain</DialogTitle>
                <DialogContent style={{display: "flex",flexDirection:"row",margin:0,padding:0}}>
                    <div style={{flexGrow:1,display: "flex",flexDirection:"column"}}>
                        <FirstPresentation />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Typography>
                        By clicking the "Continue" button you agree with our <a href={"http://funnychain.co/terms"}>Terms of Use</a> and <a href={"http://funnychain.co/privacy"}>Privacy Policy</a>.
                        <br/>
                        <br/>
                    </Typography>
                    <Fab style={{minWidth:"131px"}} color="primary" size="large" variant="extended" aria-label="Continue" onClick={() => {
                        this.skip()
                    }}><Check/>&nbsp;Continue</Fab>
                </DialogActions>
            </ModalPage>
        )
    }
}

export default withStyles(styles)(StartPopupSkipDialog);