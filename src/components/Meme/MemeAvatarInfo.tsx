import * as React from 'react'
import {Component} from 'react'
import withStyles from "@material-ui/core/styles/withStyles";
import {Meme} from "../../service/generic/Meme";
import moment from 'moment';
import Avatar from "@material-ui/core/Avatar/Avatar";

/*
.memeCommentContainer{
    align-items: flex-start;
    display: flex;
    padding-top: 16px;
    padding-left: 16px;
    padding-right: 16px;
    padding-bottom: 16px;
}

.memeCommentContainerLeft{
    flex: 0 0 auto;
    margin-right: 16px;
    display: block;
}

.memeCommentContainerRight{
    flex: 1 1 auto;
    margin-right: 16px;
    display: block;
    max-width: 100%;
}
 */
const styles = theme => ({

    "memeCommentContainer": {
        "alignItems": "flex-start",
        "display": "flex",
        "paddingTop": "16px",
        "paddingLeft": "16px",
        "paddingRight": "16px",
        "paddingBottom": "16px"
    },
    "memeCommentContainerLeft": {
        "flex": "0 0 auto",
        "marginRight": "16px",
        "display": "block"
    },
    "memeCommentContainerRight": {
        "flex": "1 1 auto",
        "marginRight": "16px",
        "display": "block",
        "maxWidth": "100%"
    }

});

class MemeAvatarInfo extends Component<{
    classes:any
    meme: Meme
}, {}> {

    render() {
        const {classes} = this.props;
        return <div className={classes.memeCommentContainer}
                    style={{marginTop: "5px", marginBottom: 0, paddingBottom: "5px", paddingTop: 0}}>
            <div className={classes.memeCommentContainerLeft}>
                <Avatar alt={this.props.meme.user.displayName}
                        src={this.props.meme.user.avatarUrl}
                        style={{width: 55, height: 55}}
                />
            </div>
            <div className={classes.memeCommentContainerRight}>
                <strong>{this.props.meme.user.displayName}</strong><br/>
                {moment(this.props.meme.created).fromNow()}
            </div>
        </div>
    }

}

export default withStyles(styles)(MemeAvatarInfo);