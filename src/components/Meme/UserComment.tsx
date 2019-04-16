import * as React from 'react'
import {Component} from 'react'
import {MemeComment} from "../../service/generic/MemeComment";
//import CardHeader from "@material-ui/core/CardHeader/CardHeader";
import Avatar from "@material-ui/core/Avatar/Avatar";
import UserCommentImage from "./UserCommentImage";
import withStyles from "@material-ui/core/styles/withStyles";
import ContentMenuButton from "./ContentMenuButton";

const ReactMarkdown = require('react-markdown')

const styles = theme => ({
    memeCommentContainer: {
        alignItems: "flex-start",
        display: "flex",
        paddingTop: "16px",
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingBottom: "16px",
    },

    memeCommentContainerLeft: {
        flex: "0 0 auto",
        marginRight: "16px",
        display: "block",
    },

    memeCommentContainerRight: {
        flex: "1 1 auto",
        marginRight: "16px",
        display: "block",
        maxWidth: "100%",
    },

    memeCommentContainerRightMarkdown: {
        maxWidth: "90%",
    },

    memeCommentContainerRightMarkdownImage: {
        maxWidth: "100%",
        maxHeight: "100%",
    }
});

export class UserComment extends Component<{
    classes: any,
    comment: MemeComment,
}, { flag: boolean }> {
    state = {
        flag: false,
    };

    render() {
        const {classes} = this.props;
        return (<React.Fragment>
            {!this.state.flag &&
            <div className={classes.memeCommentContainer}>
                <div className={classes.memeCommentContainerLeft}>
                    <Avatar alt={this.props.comment.author.displayName}
                            src={this.props.comment.author.avatarUrl}/>
                </div>
                <div className={classes.memeCommentContainerRight}>
                    <ContentMenuButton contentId={this.props.comment.id}
                                       type={"comment"}
                                       userId={this.props.comment.author.uid}
                                       onClick={() => {
                                           this.setState({flag: true});
                                       }}
                    />
                    <strong>{this.props.comment.author.displayName}</strong>
                    <ReactMarkdown
                        style={{
                            overflowWrap: "break-word"
                        }}
                        className={classes.memeCommentContainerRightMarkdown}
                        source={this.props.comment.text}
                        renderers={{
                            image: UserCommentImage
                        }}
                    />
                </div>
            </div>}
        </React.Fragment>)
    }

}


export default withStyles(styles)(UserComment);