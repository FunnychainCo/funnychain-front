import * as React from 'react'
import {Component} from 'react'
import {ThumbUp} from "@material-ui/icons";
import Button from "@material-ui/core/Button/Button";
import withStyles from "@material-ui/core/styles/withStyles";
import {authService} from "../../service/generic/AuthService";
import {Meme} from "../../service/generic/Meme";

const styles = theme => ({});

class MemeUpvoteButton extends Component<{
    meme: Meme,
    onUpvoteConfirmed: () => void,
    logged: boolean,
    classes: any,
}, {}> {


    upvote = (ev:any) => {
        ev.stopPropagation();
        if (this.props.meme.currentUserVoted !== true) {
            this.props.meme.currentUserVoted = true;
            this.props.meme.voteNumber++;
            this.setState({meme: this.props.meme});//update ui
            authService.getUserAction().vote(this.props.meme.id).then(() => {
                this.props.onUpvoteConfirmed();
            }).catch(reason => {
                console.log(reason);
                //cancel previous operation
                this.props.meme.currentUserVoted = false;
                this.props.meme.voteNumber--;
                this.setState({meme: this.props.meme});//update ui
            });
        }
    };

    render() {
        //const {classes} = this.props;
        return <Button variant="outlined"
                       color={this.props.meme.currentUserVoted ? "secondary" : "default"}
                       aria-label="Upvote"
                       disabled={!this.props.logged}
                       onClick={this.upvote}
                       disableRipple={true}
                       disableTouchRipple={true}
        >
            {this.props.meme.voteNumber}&nbsp;
            <ThumbUp style={{height: "0.7em"}}/>
        </Button>
    }

}

export default withStyles(styles)(MemeUpvoteButton);