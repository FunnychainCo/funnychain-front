import * as React from 'react'
import {Component} from 'react'
import "./Meme.css"
import withStyles from "@material-ui/core/styles/withStyles";
import {Meme} from "../../service/generic/Meme";
import MemeBetButton from "./MemeBetButton";
import MemeUpvoteButton from "./MemeUpvoteButton";
import {MemeLinkInterface} from "../../service/generic/ApplicationInterface";
import LolTokenIcon from "../Icon/LolTokenIcon";
import MemeShareButton from "./MemeShareButton";

const styles = theme => ({});

class MemeActionButton extends Component<{
    meme: Meme,
    memeLink:MemeLinkInterface,
    logged:boolean
}, {}> {

    render() {
        //const {classes} = this.props;
        return <div className="memeElementStyleDivContainer">
            <MemeShareButton url={"https://"+window.location.host+"/meme/"+this.props.meme.id}/>
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
            <div className="memeElementStyleDiv" style={{marginLeft:"5px",marginRight:"5px"}}>
                <b>&#36;{(this.props.meme.dolarValue * 0.08).toFixed(2)}</b>(<LolTokenIcon/> {this.props.meme.dolarValue.toFixed(2)})
                </div>
            }
        </div>
    }

}

export default withStyles(styles)(MemeActionButton);