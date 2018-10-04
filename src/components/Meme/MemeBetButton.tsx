import {Component} from 'react'
import "./Meme.css"
import * as React from 'react';
import Button from "@material-ui/core/Button/Button";
import withStyles from "@material-ui/core/styles/withStyles";
import {authService} from "../../service/generic/AuthService";
import {Meme} from "../../service/generic/Meme";
import { CashMultiple } from 'mdi-material-ui';

const styles = theme => ({});

class MemeBetButton extends Component<{
    meme: Meme,
    onBetConfirmed: () => void,
    logged: boolean,
    classes: any,
}, {}> {

    state={
        currentUserBet:false
    };

    bet = () => {
        if (this.state.currentUserBet !== true) {
            this.setState({currentUserBet: true});//update ui
            authService.getUserAction().bet(this.props.meme.id).then(() => {
                this.props.onBetConfirmed();
            }).catch(reason => {
                console.log(reason);
                //cancel previous operation
                this.setState({currentUserBet: false});//update ui
                this.setState({meme: this.props.meme});//update ui
            });
        }
    };

    render() {
        //const {classes} = this.props;
        return <Button variant="outlined"
                       color={this.state.currentUserBet ? "secondary" : "default"}
                       aria-label="Bet"
                       disabled={!this.props.logged}
                       onClick={this.bet}>
            Bet !&nbsp;
            <CashMultiple style={{height: "0.7em"}}/>
        </Button>
    }

}

export default withStyles(styles)(MemeBetButton);