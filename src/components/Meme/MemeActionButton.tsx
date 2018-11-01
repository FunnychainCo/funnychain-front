import {Component} from 'react'
import "./Meme.css"
import * as React from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import {Meme} from "../../service/generic/Meme";
import MemeBetButton from "./MemeBetButton";
import MemeUpvoteButton from "./MemeUpvoteButton";
import DogeIcon from "../Icon/DogeIcon";
import {MemeLinkInterface} from "../../service/generic/ApplicationInterface";

const styles = theme => ({});

class MemeActionButton extends Component<{
    meme: Meme,
    memeLink:MemeLinkInterface,
    logged:boolean
}, {}> {

    render() {
        //const {classes} = this.props;
        return <div className="memeElementStyleDivContainer">
            {this.props.meme.hot === true &&
            <MemeUpvoteButton meme={this.props.meme} logged={this.props.logged} onUpvoteConfirmed={() => {
                this.props.memeLink.refresh();
            }}/>
            }
            {this.props.meme.hot === false &&
            <MemeUpvoteButton meme={this.props.meme} logged={this.props.logged} onUpvoteConfirmed={() => {
                this.props.memeLink.refresh();
            }}/>
            }
            {this.props.meme.hot === false &&
            <MemeBetButton meme={this.props.meme} logged={this.props.logged} onBetConfirmed={() => {
                this.props.memeLink.refresh();
            }}/>}
            {this.props.meme.hot === true &&
            <div className="memeElementStyleDiv"><DogeIcon/> {this.props.meme.dolarValue.toFixed(2)}</div>
            }
        </div>
    }

}

export default withStyles(styles)(MemeActionButton);