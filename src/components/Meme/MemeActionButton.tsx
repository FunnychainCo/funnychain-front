import * as React from 'react'
import {Component} from 'react'
import withStyles from "@material-ui/core/styles/withStyles";
import {Meme} from "../../service/generic/Meme";
import MemeUpvoteButton from "./MemeUpvoteButton";
import {MemeLinkInterface} from "../../service/generic/ApplicationInterface";
import MemeShareButton from "./MemeShareButton";
import MoneyCoinIcon from "../Icon/MoneyCoinIcon";
import {GLOBAL_PROPERTIES} from "../../properties/properties";

const styles = theme => ({});

class MemeActionButton extends Component<{
    meme: Meme,
    memeLink: MemeLinkInterface,
    logged: boolean
}, {}> {

    render() {
        //const {classes} = this.props;
        return <div style={{
            display: "flex",
            alignItems: "center",
        }}>
            <MemeShareButton url={GLOBAL_PROPERTIES.FUNNYCHAIN_HOST() + "/meme/" + this.props.meme.id}/>
            <MemeUpvoteButton meme={this.props.meme} logged={this.props.logged} onUpvoteConfirmed={() => {
                this.props.memeLink.refresh();
            }}/>
            {this.props.meme.hot === true &&
            <div style={{
                flexShrink:0,
                marginTop: "auto",
                marginBottom: "auto",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                marginLeft: "5px", marginRight: "5px",
                textOverflow:" "
            }}>
                <MoneyCoinIcon/> &nbsp;{this.props.meme.dolarValue.toFixed(2)}
            </div>
            }
        </div>
    }

}

export default withStyles(styles)(MemeActionButton);