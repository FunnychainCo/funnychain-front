import * as React from 'react'
import {Component} from 'react'
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import {withStyles} from '@material-ui/core/styles';
//import store from 'store';
import ModalPage from "../ModalPage/ModalPage";
import {Check} from 'mdi-material-ui';
import Typography from "@material-ui/core/Typography";
import FirstPresentation from "./FirstPresentation";
import Button from "@material-ui/core/Button";
import ExternalLink from "../Link/ExternalLink";
import {cookiesService} from "../../service/ssr/CookiesService"; //https://materialdesignicons.com/

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
        //let skiped = store.get(this.skipPopupStoreKey, false);
        let skiped = cookiesService.cookies.get(this.skipPopupStoreKey)?cookiesService.cookies.get(this.skipPopupStoreKey):false;
        let displayPopup = !skiped;
        this.setState({open: displayPopup});
    }


    skip() {
        this.doNotShowPopupAgain();
        this.handleClose();
    }

    doNotShowPopupAgain() {
        //store.set(this.skipPopupStoreKey, true);
        cookiesService.cookies.set(this.skipPopupStoreKey,true);
    }

    handleClose() {
        this.setState({open: false});
    }

    render() {
        return (
            <ModalPage
                open={this.state.open}
            >
                <DialogContent style={{display: "flex", flexDirection: "row", margin: 0, padding: 0}}>
                    <div style={{flexGrow: 1, display: "flex", flexDirection: "column"}}>
                        <FirstPresentation/>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Typography>
                        By clicking the "Continue" button you agree with our&nbsp;
                        <ExternalLink style={{textDecoration: "underline", color: "#0000ee"}}
                                      href={"http://start.funnychain.co/terms"}>
                            Terms of Use
                        </ExternalLink>
                        &nbsp;and&nbsp;
                        <ExternalLink style={{textDecoration: "underline", color: "#0000ee"}}
                                      href={"http://start.funnychain.co/privacy"}>
                            Privacy Policy
                        </ExternalLink>.
                        <br/>
                        <br/>
                    </Typography>
                    <Button style={{minWidth: "131px"}} color="primary" size="medium" variant="outlined"
                            aria-label="Continue" onClick={() => {
                        this.skip()
                    }}><Check/>&nbsp;Continue</Button>
                </DialogActions>
            </ModalPage>
        )
    }
}

export default withStyles(styles)(StartPopupSkipDialog);