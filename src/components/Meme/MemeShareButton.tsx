import * as React from 'react'
import {Component} from 'react'
import withStyles from "@material-ui/core/styles/withStyles";
import {
    FacebookIcon,
    TwitterIcon,
    TelegramIcon,
    RedditIcon,
    WhatsappIcon,
} from 'react-share';
import Button from "@material-ui/core/Button";
import Popover from "@material-ui/core/Popover";
import ShareIcon from '@material-ui/icons/Share';
import ExternalLink from "../Link/ExternalLink";

const styles = theme => ({});

//https://github.com/nygardk/react-share/tree/master/src
function objectToGetParams(object) {
    return '?' + Object.keys(object)
        .filter(key => !!object[key])
        .map(key => `${key}=${encodeURIComponent(object[key])}`)
        .join('&');
}

function facebookLink(url, {quote, hashtag}) {
    return 'https://www.facebook.com/sharer/sharer.php' + objectToGetParams({
        u: url,
        quote,
        hashtag,
    });
}

function twitterLink(url, {title, via, hashtags = []}) {
    return 'https://twitter.com/share' + objectToGetParams({
        url,
        text: title,
        via,
        hashtags: hashtags.join(','),
    });
}

function telegramLink(url, {title}) {
    return 'https://telegram.me/share/' + objectToGetParams({
        url,
        text: title,
    });
}

function redditLink(url, {title}) {
    return 'https://www.reddit.com/submit' + objectToGetParams({
        url,
        title,
    });
}

function whatsappLink(url, {title, separator}) {
    return 'https://api.whatsapp.com/send' + objectToGetParams({
        text: title ? title + separator + url : url,
    });
}

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
                <div style={{overflow: "hidden", padding: "5px", margin: "5px",display: "flex",flexDirection: "row"}}>
                    <ExternalLink href={facebookLink(this.props.url, {quote: '', hashtag: ''})}>
                        <FacebookIcon size={32} round={true}/></ExternalLink>
                    <ExternalLink href={twitterLink(this.props.url, {title: "", via: "https://funnychain.co"})}>
                        <TwitterIcon size={32} round={true}/></ExternalLink>
                    <ExternalLink href={telegramLink(this.props.url, {title: ""})}>
                        <TelegramIcon size={32} round={true}/></ExternalLink>
                    <ExternalLink href={redditLink(this.props.url, {title: ""})}>
                        <RedditIcon size={32} round={true}/></ExternalLink>
                    <ExternalLink href={whatsappLink(this.props.url, {title: "", separator: "-"})}>
                        <WhatsappIcon size={32} round={true}/></ExternalLink>
                </div>
            </Popover>
        </div>
    }
}

export default withStyles(styles)(MemeShareButton);