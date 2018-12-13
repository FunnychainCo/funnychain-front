import * as React from 'react'
import {Component} from 'react'
import "./Meme.css"
import withStyles from "@material-ui/core/styles/withStyles";
import {
    FacebookShareButton,
    TwitterShareButton,
    TelegramShareButton,
    RedditShareButton,
    WhatsappShareButton,
    FacebookIcon,
    TwitterIcon,
    TelegramIcon,
    RedditIcon,
    WhatsappIcon
} from 'react-share';
import Button from "@material-ui/core/Button";
import Popover from "@material-ui/core/Popover";
import ShareIcon from '@material-ui/icons/Share';

const styles = theme => ({});

class MemeShareButton extends Component<{ url: string }, { anchorEl: any }> {

    state = {
        anchorEl: null,
    };

    handleClick = event => {
        this.setState({
            anchorEl: event.currentTarget,
        });
    };

    handleClose = () => {
        this.setState({
            anchorEl: null,
        });
    };

    render() {
        const {anchorEl} = this.state;
        const open = Boolean(anchorEl);
        //const {classes} = this.props;
        return <div className="memeElementStyleDivContainer">

            <Button
                aria-owns={open ? 'simple-popper' : undefined}
                aria-haspopup="true"
                variant="outlined"
                onClick={this.handleClick}
            >
                &nbsp;<ShareIcon style={{height: "0.9em"}}/>
            </Button>

            <Popover
                id="simple-popper"
                open={open}
                anchorEl={anchorEl}
                onClose={this.handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <div style={{overflow: "hidden", padding: "5px", margin: "5px"}}>
                    <FacebookShareButton style={{overflow: "hidden", margin: "5px"}} url={this.props.url}><FacebookIcon
                        size={32} round={true}/></FacebookShareButton>
                    <TwitterShareButton style={{overflow: "hidden", margin: "5px"}} url={this.props.url}><TwitterIcon
                        size={32} round={true}/></TwitterShareButton>
                    <TelegramShareButton style={{overflow: "hidden", margin: "5px"}} url={this.props.url}><TelegramIcon
                        size={32} round={true}/></TelegramShareButton>
                    <RedditShareButton style={{overflow: "hidden", margin: "5px"}} url={this.props.url}><RedditIcon
                        size={32} round={true}/></RedditShareButton>
                    <WhatsappShareButton style={{overflow: "hidden", margin: "5px"}} url={this.props.url}><WhatsappIcon
                        size={32} round={true}/></WhatsappShareButton>
                </div>
            </Popover>
        </div>
    }

}

export default withStyles(styles)(MemeShareButton);