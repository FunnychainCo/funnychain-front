import {Component} from 'react'
//import * as ImagesLoaded from 'react-images-loaded';
import "./Meme.css"
import {
    CommentsVisitor,
    MemeComment,
    MemeLinkInterface
} from "../../service/generic/ApplicationInterface";
import * as React from 'react';
import Card from "@material-ui/core/Card/Card";
import CardHeader from "@material-ui/core/CardHeader/CardHeader";
import CardActions from "@material-ui/core/CardActions/CardActions";
import {
    ChatBubbleOutline,
    KeyboardArrowLeft,
    KeyboardArrowRight,
    Send,
    ThumbUp
} from "@material-ui/icons";
import Button from "@material-ui/core/Button/Button";
import Collapse from "@material-ui/core/Collapse/Collapse";
import CardContent from "@material-ui/core/CardContent/CardContent";
import withStyles from "@material-ui/core/styles/withStyles";
import {commentService} from "../../service/generic/CommentService";
import {memeService} from "../../service/generic/MemeService";
import {authService} from "../../service/generic/AuthService";
import LoadingBlock from "../LoadingBlock/LoadingBlock";
import TextField from "@material-ui/core/TextField/TextField";
import UserComment from "./UserComment";
import MobileStepper from "@material-ui/core/MobileStepper/MobileStepper";
import * as moment from 'moment';
import Avatar from "@material-ui/core/Avatar/Avatar";
import {USER_ENTRY_NO_VALUE} from "../../service/generic/UserEntry";
import {Meme, MEME_ENTRY_NO_VALUE} from "../../service/generic/Meme";


const styles = theme => ({
    actions: {
        display: 'flex',
    },
    expand: {
        transform: 'rotate(0deg)',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    }
});

class MemeComponent extends Component<{
    meme: Meme,
    classes: any
}, {
    meme: Meme,
    expanded: boolean,
    comments: MemeComment[],
    commentToPost: string,
    logged: boolean,
    loadingComment: boolean,
    page: number,
    maxPage: number
}> {
    state = {
        meme: MEME_ENTRY_NO_VALUE,
        expanded: false,
        comments: [],
        commentToPost: "",
        logged: false,
        loadingComment: true,
        page: 0,
        maxPage: 1
    };

    commentVisitor: CommentsVisitor;
    private removeListener: () => void;
    commentPerPage = 5;
    private memeLink: MemeLinkInterface;

    componentDidMount() {
        let meme = this.props.meme;
        this.memeLink = memeService.getMemeLink(meme.id);
        this.removeListener = authService.onAuthStateChanged((user) => {
            this.setState({
                logged: user != USER_ENTRY_NO_VALUE ? true : false
            });
            this.memeLink.refresh();
        });

        this.memeLink.on(meme => {
            this.setState({
                maxPage: Math.floor(meme.commentNumber / this.commentPerPage) + 1,
                meme: meme
            });
        });
        this.setState({
            maxPage: Math.floor(meme.commentNumber / this.commentPerPage) + 1,
            meme: meme
        });
        this.commentVisitor = commentService.getCommentVisitor(meme.id);
        this.commentVisitor.on((comments: MemeComment[]) => {
            let concat = comments.concat(this.state.comments);
            this.setState({comments: concat, loadingComment: false});
        });
    }

    componentWillUnmount() {
        this.removeListener();
    }

    upvote = () => {
        if (this.state.meme.currentUserVoted !== true) {
            this.state.meme.currentUserVoted = true;
            this.state.meme.voteNumber++;
            this.setState({meme: this.state.meme});//update ui
            memeService.vote(this.state.meme.id).then(() => {
                this.memeLink.refresh();//refresh meme on every action from user
            }).catch(reason => {
                console.log(reason);
                //cancel previous operation
                this.state.meme.currentUserVoted = false;
                this.state.meme.voteNumber--;
                this.setState({meme: this.state.meme});//update ui
            });
        }
    };

    post = () => {
        this.state.meme.commentNumber++;
        this.setState({meme: this.state.meme});//update ui
        this.commentVisitor.postComment(this.state.meme.id, this.state.commentToPost).then(() => {
            this.memeLink.refresh();//refresh meme on every action from user
        }).catch(reason => {
            //cancel previous operation
            this.state.meme.commentNumber--;
            this.setState({meme: this.state.meme});//update ui
        });
        this.setState({commentToPost: ""});//errase old comment value
    };

    handleExpandClick = () => {
        if (!this.state.expanded) {
            this.commentVisitor.loadMore(this.commentPerPage * 2);//preload two page
        }
        this.setState({expanded: !this.state.expanded});
        this.memeLink.refresh();//refresh meme on every action from user
    };

    getComments = (): MemeComment[] => {
        let array: MemeComment[] = this.state.comments;
        return array.slice(this.state.page, this.state.page + 5);
    };

    handleNext = () => {
        if (this.state.page > this.state.maxPage) {
            return;
        }
        this.commentVisitor.loadMore(this.commentPerPage);//preload nex page
        this.setState({page: this.state.page + 1});
        this.memeLink.refresh();//refresh meme on every action from user
    };

    handleBack = () => {
        if (this.state.page - 1 < 0) {
            return;
        }
        this.setState({page: this.state.page - 1});
        this.memeLink.refresh();//refresh meme on every action from user
    };

    render() {
        const {classes} = this.props;
        return <Card>
            <CardHeader
                title={this.state.meme.title}
            />
            <img className="memeImage" src={this.state.meme.imageUrl} alt=""/>
            <CardActions className="memeElementStyleDivContainer">
                <Button variant="outlined"
                        color={this.state.meme.currentUserVoted ? "secondary" : "default"}
                        aria-label="Upvote"
                        disabled={!this.state.logged}
                        onClick={this.upvote}>
                    {this.state.meme.voteNumber}&nbsp;
                    <ThumbUp style={{height: "0.7em"}}/>
                </Button>
                <div className="memeElementStyleDiv">$ {this.state.meme.dolarValue}</div>
                <div style={{marginLeft: 'auto'}}>
                    <Button variant="outlined"
                            onClick={this.handleExpandClick}
                            aria-expanded={this.state.expanded}
                            aria-label="Show more"
                    >
                        {this.state.meme.commentNumber}&nbsp;
                        <ChatBubbleOutline style={{height: "0.7em"}}/>
                        {/*<ExpandMore className={classnames(classes.expand, {[classes.expandOpen]: this.state.expanded,})}/>*/}
                    </Button>
                </div>
            </CardActions>
            <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
                <CardContent style={{marginTop: 0, paddingTop: 0}}>
                    <div className="memeCommentContainer"
                         style={{marginTop: 0, marginBottom: 0, paddingBottom: 0, paddingTop: 0}}>
                        <div className="memeCommentContainerLeft">
                            <Avatar alt={this.state.meme.user.displayName}
                                    src={this.state.meme.user.avatarUrl}
                                    style={{width: 55, height: 55}}
                            />
                        </div>
                        <div className="memeCommentContainerRight">
                            <strong>{this.state.meme.user.displayName}</strong><br/>
                            <a href={"https://steemit.com" + this.state.meme.id}>SteemIt</a><br/>
                            {moment(this.state.meme.created).fromNow()}
                        </div>
                    </div>
                    <TextField
                        disabled={!this.state.logged}
                        id="multiline-flexible"
                        label="Post a comment"
                        multiline
                        rows="3"
                        rowsMax="10"
                        value={this.state.commentToPost}
                        onChange={(event) => {
                            this.setState({commentToPost: event.target.value,});
                        }}
                        margin="normal"
                        fullWidth
                        style={{marginTop: 0, paddingTop: 0}}
                    />
                    <Button variant="outlined" color="primary" aria-label="Post!"
                            onClick={this.post}
                            autoFocus={true}
                            disabled={this.state.commentToPost.replace(new RegExp(" ", "g"), "") == "" || !this.state.logged}
                    >
                        <Send/>&nbsp;POST
                    </Button>
                    {
                        this.getComments().map((comment: MemeComment, index) => {
                            return <UserComment key={index} comment={comment}/>
                        })
                    }
                    {this.state.loadingComment && <LoadingBlock/>}
                    {this.state.maxPage > 1 &&
                    <MobileStepper
                        variant="dots"
                        steps={this.state.maxPage}
                        position="static"
                        activeStep={this.state.page}
                        className={classes.root}
                        nextButton={
                            <Button size="small" onClick={this.handleNext}
                                    disabled={this.state.page === (this.state.maxPage - 1)}>
                                Next
                                <KeyboardArrowRight/>
                            </Button>
                        }
                        backButton={
                            <Button size="small" onClick={this.handleBack} disabled={this.state.page === 0}>
                                <KeyboardArrowLeft/>
                                Back
                            </Button>
                        }
                    />}
                </CardContent>
            </Collapse>
        </Card>
    }

}

export default withStyles(styles)(MemeComponent);