import {Component} from 'react'
import "./Meme.css"
import * as React from 'react';
import Button from "@material-ui/core/Button/Button";
import withStyles from "@material-ui/core/styles/withStyles";
import {authService} from "../../service/generic/AuthService";
import {Meme} from "../../service/generic/Meme";
import {CashMultiple} from 'mdi-material-ui';

const styles = theme => ({});

class MemeBetButton extends Component<{
    meme: Meme,
    onBetConfirmed: () => void,
    logged: boolean,
    classes: any,
}, {}> {


    bet = () => {
        if (this.props.meme.currentUserBet !== true) {
            this.props.meme.currentUserBet = true;
            //also upvote
            if (this.props.meme.currentUserVoted !== true) {
                this.props.meme.currentUserVoted = true;
                this.props.meme.voteNumber++;
            }
            this.setState({meme: this.props.meme});//update ui
            authService.getUserAction().bet(this.props.meme.id).then(() => {
                this.props.onBetConfirmed();
            }).catch(reason => {
                console.log(reason);
                //cancel previous operation
                //upvote not canceled
                this.props.meme.currentUserBet = false;
                this.setState({meme: this.props.meme});//update ui
            });
        }
    };

    render() {
        //const {classes} = this.props;
        return <div>{this.props.meme.betable &&
        <Button variant="outlined"
                color={this.props.meme.currentUserBet ? "secondary" : "default"}
                aria-label="Bet"
                disabled={!this.props.logged}
                onClick={this.bet}>
            Bet !&nbsp;
            <CashMultiple style={{height: "0.7em"}}/>
        </Button>}</div>
    }

}

export default withStyles(styles)(MemeBetButton);