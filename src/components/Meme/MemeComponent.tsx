import {Component} from 'react'
//import * as ImagesLoaded from 'react-images-loaded';
import "./Meme.css"
import {
    CommentsVisitor,
    MemeLinkInterface
} from "../../service/generic/ApplicationInterface";
import * as React from 'react';
import Card from "@material-ui/core/Card/Card";
import CardHeader from "@material-ui/core/CardHeader/CardHeader";
import CardActions from "@material-ui/core/CardActions/CardActions";
import {
    ChatBubbleOutline,
    Send,
    ThumbUp
} from "@material-ui/icons";
import Button from "@material-ui/core/Button/Button";
import Collapse from "@material-ui/core/Collapse/Collapse";
import CardContent from "@material-ui/core/CardContent/CardContent";
import withStyles from "@material-ui/core/styles/withStyles";
import {authService} from "../../service/generic/AuthService";
import LoadingBlock from "../LoadingBlock/LoadingBlock";
import TextField from "@material-ui/core/TextField/TextField";
import UserComment from "./UserComment";
import * as moment from 'moment';
import Avatar from "@material-ui/core/Avatar/Avatar";
import {USER_ENTRY_NO_VALUE} from "../../service/generic/UserEntry";
import {Meme, MEME_ENTRY_NO_VALUE} from "../../service/generic/Meme";
import { Link } from 'react-router-dom';
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";
import {MemeComment} from "../../service/generic/MemeComment";


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

interface State {
    meme: Meme,
    expanded: boolean,
    comments: MemeComment[],
    commentToPost: string,
    logged: boolean,
    loadingComment: boolean,
    commentNumber: number,
    fullDisplay: boolean,
}

class MemeComponent extends Component<{
    meme: MemeLinkInterface,
    classes: any
},State > {
    state:State = {
        meme: MEME_ENTRY_NO_VALUE,
        expanded: false,
        comments: [],
        commentToPost: "",
        logged: false,
        loadingComment: true,
        commentNumber: 0,
        fullDisplay: false,
    };

    private commentVisitor: CommentsVisitor;
    private removeListener: () => void;
    private commentPerPage = 5;
    private memeLink: MemeLinkInterface;
    private removeListenerMemeLink: () => void;
    private removeListenerCommentVisitor: () => void;

    componentDidMount() {
        this.memeLink = this.props.meme;
        this.removeListener = authService.onAuthStateChanged((user) => {
            this.setState({
                logged: user != USER_ENTRY_NO_VALUE ? true : false
            });
            this.memeLink.refresh();
        });

        this.removeListenerMemeLink = this.memeLink.on(meme => {
            this.setState({
                commentNumber: meme.commentNumber,
                meme: meme
            });
        });
        this.commentVisitor = this.memeLink.getCommentVisitor();
        this.removeListenerCommentVisitor = this.commentVisitor.on((comments: MemeComment[]) => {
            let concat = comments.concat(this.state.comments);
            this.setState({comments: concat, loadingComment: false});
        });
    }

    componentWillUnmount() {
        this.removeListener();
        this.removeListenerMemeLink();
        this.removeListenerCommentVisitor();
    }

    upvote = () => {
        if (this.state.meme.currentUserVoted !== true) {
            this.state.meme.currentUserVoted = true;
            this.state.meme.voteNumber++;
            this.setState({meme: this.state.meme});//update ui
            authService.getUserAction().vote(this.state.meme.id).then(() => {
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
        authService.getUserAction().postComment(this.state.meme.id, this.state.commentToPost).then(() => {
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
            this.commentVisitor.loadMore(this.commentPerPage);
        }
        this.setState({expanded: !this.state.expanded});
        this.memeLink.refresh();//refresh meme on every action from user
    };

    getComments = (): MemeComment[] => {
        let array: MemeComment[] = this.state.comments;
        let commentPerPage = this.commentPerPage;
        let page = 0;
        return array.slice((page * commentPerPage), ((page + 1) * commentPerPage));
    };

    render() {
        //const {classes} = this.props;
        const MemeDisplayLink = (props) => <Link to={"/meme/"+encodeURIComponent(this.state.meme.id)} {...props} />
        return <Card>
            <CardHeader
                title={this.state.meme.title}
            />
            <ButtonBase className="memeImage" component={MemeDisplayLink}><img className="memeImage" src={this.state.meme.imageUrl} alt=""/></ButtonBase>
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
                    {this.state.loadingComment && <LoadingBlock/>}
                    {!this.state.loadingComment && <div>
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
                        {this.state.commentNumber > this.commentPerPage &&
                        <Button variant="contained" color="primary" fullWidth size="large" component={MemeDisplayLink}>
                            Show more comment
                        </Button>}
                    </div>}
                </CardContent>
            </Collapse>
        </Card>
    }

}

export default withStyles(styles)(MemeComponent);