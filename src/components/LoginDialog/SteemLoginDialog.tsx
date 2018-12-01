import * as React from 'react';
import {Component} from 'react';
import ModalPage from "../ModalPage/ModalPage";
import {steemConnectAuthService} from "../../service/steem/steemConnect/SteemConnectAuthService";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import Button from "@material-ui/core/Button/Button";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";

export default class SteemLoginDialog extends Component<any,any> {
    state = {
        loading: false
    };


    componentDidMount(){
    }

    handleClose = () => {
        this.props.onRequestClose();
    };

    handleSubmit = () => {
        window.location.href = steemConnectAuthService.getLoginURL();
    };

    render() {
        return (
            <ModalPage
                open={this.props.open}
                onClose={this.handleClose}
            >
                {!this.state.loading && <DialogContent>
                    <Button
                        onClick={()=>{window.location.href = "https://signup.steemit.com/?ref=funnychain"}}
                        variant="contained"
                        fullWidth
                        style={{marginBottom:"20px",backgroundColor:"#4556e9"}}
                    >
                        <img src="/static/steem/steemit-logo.png" alt="steem" style={{width:"40px",height:"40px"}}/>
                        &nbsp;&nbsp;Sign up on steem.it
                    </Button>
                    <Button
                        onClick={this.handleSubmit}
                        variant="contained"
                        fullWidth
                        style={{marginBottom:"20px",backgroundColor:"#4556e9"}}
                    >
                        <img src="/static/steem/steemit-logo.png" alt="steem" style={{width:"40px",height:"40px"}}/>
                        &nbsp;&nbsp;Login with steem account
                    </Button>
                </DialogContent>}
                {!this.state.loading && <DialogActions>
                    <Button onClick={this.handleClose} color="primary">
                        Cancel
                    </Button>
                </DialogActions>}
                {this.state.loading && <CircularProgress/>}
            </ModalPage>
        )
    }
}
