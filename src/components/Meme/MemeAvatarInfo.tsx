import {Component} from 'react'
import "./Meme.css"
import * as React from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import {Meme} from "../../service/generic/Meme";
import * as moment from 'moment';
import Avatar from "@material-ui/core/Avatar/Avatar";

const styles = theme => ({});

class MemeAvatarInfo extends Component<{
    meme: Meme
}, {}> {

    render() {
        //const {classes} = this.props;
        return <div className="memeCommentContainer"
                    style={{marginTop: 0, marginBottom: 0, paddingBottom: 0, paddingTop: 0}}>
            <div className="memeCommentContainerLeft">
                <Avatar alt={this.props.meme.user.displayName}
                        src={this.props.meme.user.avatarUrl}
                        style={{width: 55, height: 55}}
                />
            </div>
            <div className="memeCommentContainerRight">
                <strong>{this.props.meme.user.displayName}</strong><br/>
                {moment(this.props.meme.created).fromNow()}
            </div>
        </div>
    }

}

export default withStyles(styles)(MemeAvatarInfo);