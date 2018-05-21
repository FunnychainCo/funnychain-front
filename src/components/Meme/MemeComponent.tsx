import {Component} from 'react'
//import * as ImagesLoaded from 'react-images-loaded';
import "./Meme.css"
import {CommentsVisitor, Meme, MEME_ENTRY_NO_VALUE, MemeComment} from "../../service/generic/ApplicationInterface";
import * as React from 'react';
import Card from "@material-ui/core/Card/Card";
import CardHeader from "@material-ui/core/CardHeader/CardHeader";
import CardActions from "@material-ui/core/CardActions/CardActions";
import {ArrowUpward, ChatBubbleOutline, ExpandMore, Send, ThumbUp} from "@material-ui/icons";
import Button from "@material-ui/core/Button/Button";
import IconButton from "@material-ui/core/IconButton/IconButton";
import Collapse from "@material-ui/core/Collapse/Collapse";
import CardContent from "@material-ui/core/CardContent/CardContent";
import withStyles from "@material-ui/core/styles/withStyles";
import classnames from 'classnames';
import Avatar from "@material-ui/core/Avatar/Avatar";
import TextField from "material-ui/TextField/TextField";
import {commentService} from "../../service/generic/CommentService";
import {memeService} from "../../service/generic/MemeService";

const ReactMarkdown = require('react-markdown')


interface PropsType {
    meme: Meme,
    classes: any
}

interface StateType {
    meme: Meme,
    expanded: boolean,
    comments: MemeComment[],
    commentToPost:string,
}

const styles = theme => ({
    actions: {
        display: 'flex',
    },
    expand: {
        transform: 'rotate(0deg)',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
        marginLeft: 'auto',
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    }
});

class MemeComponent extends Component<PropsType, StateType> {
    state = {
        meme: MEME_ENTRY_NO_VALUE,
        expanded: false,
        comments: [],
        commentToPost:""
    };

    commentVisitor: CommentsVisitor;

    componentDidMount() {
        var meme = this.props.meme;
        this.setState({meme: meme});
        this.commentVisitor = commentService.getCommentVisitor(meme.id);
        this.commentVisitor.on((comments: MemeComment[]) => {
            let concat = comments.concat(this.state.comments);
            this.setState({comments: concat});
        });
    }

    upvote = () => {
        if(this.state.meme.currentUserVoted!=true) {
            this.state.meme.currentUserVoted=true;
            this.setState({meme:this.state.meme});//update ui
            memeService.vote(this.state.meme.id);
        };
    };

    post = () => {
        this.commentVisitor.postComment(this.state.meme.id,this.state.commentToPost);
        this.setState({commentToPost:""});//errase old comment value
    };

    handleExpandClick = () => {
        if (!this.state.expanded) {
            this.commentVisitor.loadMore(30);
        }
        this.setState({expanded: !this.state.expanded});
    };

    render() {
        const {classes} = this.props;
        return <Card>
            <CardHeader
                title={this.state.meme.title}
            />
            <img className="memeImage" src={this.state.meme.imageUrl} alt=""/>
            <CardActions className="memeElementStyleDivContainer">
                <Button variant="outlined" color={this.state.meme.currentUserVoted ? "secondary" : "default"} aria-label="Upvote"
                        onClick={this.upvote}>
                    <ArrowUpward/>
                </Button>
                <div className="memeElementStyleDiv">$ {this.state.meme.dolarValue}</div>
                <div className="memeElementStyleDiv"><ThumbUp style={{height: "0.7em"}}
                                                              color="action"/> {this.state.meme.voteNumber}</div>
                <div className="memeElementStyleDiv"><ChatBubbleOutline style={{height: "0.7em"}}
                                                                        color="action"/> {this.state.meme.commentNumber}
                </div>

                <IconButton
                    className={classnames(classes.expand, {[classes.expandOpen]: this.state.expanded,})}
                    onClick={this.handleExpandClick}
                    aria-expanded={this.state.expanded}
                    aria-label="Show more"
                >
                    <ExpandMore/>
                </IconButton>
            </CardActions>
            <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    <a href={"https://steemit.com" + this.state.meme.id}>SteemIt</a>
                    <TextField
                        id="multiline-flexible"
                        label="Post a comment"
                        multiline
                        rows="3"
                        rowsMax="10"
                        value={this.state.commentToPost}
                        onChange={(event)=>{this.setState({commentToPost: event.target.value,});}}
                        margin="normal"
                        fullWidth
                    />
                    <Button variant="outlined" color="primary" aria-label="Post!"
                            onClick={this.post}
                            disabled={this.state.commentToPost.replace(" ","")==""}
                    >
                        <Send/>&nbsp;POST
                    </Button>
                    {
                        this.state.comments.map((comment: MemeComment, index) => {
                            return <CardHeader key={index}
                                               style={{alignItems: "start"}}
                                               avatar={
                                                   <Avatar alt={comment.author.displayName}
                                                           src={comment.author.avatarUrl}/>
                                               }
                                               title={comment.author.displayName}
                                               subheader={<ReactMarkdown source={comment.text}/>}
                            />
                        })
                    }
                </CardContent>
            </Collapse>
        </Card>
    }

}

export default withStyles(styles)(MemeComponent);