import {Component} from 'react';
import * as React from 'react';
import ModalPage from "../ModalPage/ModalPage";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import Button from "@material-ui/core/Button/Button";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import Typography from "@material-ui/core/Typography";

export default class AboutUsDialog extends Component<{onRequestClose:()=>void,open:boolean},{}> {
    state = {};


    componentDidMount(){
    }

    handleClose = () => {
        this.props.onRequestClose();
    };

    render() {
        return (
            <ModalPage
                open={this.props.open}
                onClose={this.handleClose}
            >
                <DialogContent>
                    <h1>About us</h1>
                    <Typography>
                        Significant hurdles prevent cryptocurrency mass adoption (volatility, scalability, time and education). We believe that with Funnychain, by having fun looking at memes, people will be using a decentralized application (with no central authority) and earn cryptocurrencies using it.<br />
                        A meme dApp where people gets rewarded in crypto without having to buy it first is the best way to bring crypto mass adoption.<br />
                        Funnychain allows users to view and share the funniest-rated memes with their friends, workplace, and the community. The platform incentivizes users for creating, curating, sharing memes, and especially rewards community founders/admins. Users can also bet on their favorite memes in cryptocurrencies, chat with friends using their favorite memes and share with their own community.<br />
                        <br />
                        Break the barriers for crypto mass adoption.<br />
                        Funny and make money.<br />
                        - <b>Funnychain</b><br />
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </ModalPage>
        )
    }
}
