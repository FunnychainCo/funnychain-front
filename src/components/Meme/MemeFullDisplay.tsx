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
    Send,
    ThumbUp
} from "@material-ui/icons";
import Button from "@material-ui/core/Button/Button";
import CardContent from "@material-ui/core/CardContent/CardContent";
import withStyles from "@material-ui/core/styles/withStyles";
import {commentService} from "../../service/generic/CommentService";
import {memeService} from "../../service/generic/MemeService";
import {authService} from "../../service/generic/AuthService";
import LoadingBlock from "../LoadingBlock/LoadingBlock";
import TextField from "@material-ui/core/TextField/TextField";
import UserComment from "./UserComment";
import * as moment from 'moment';
import Avatar from "@material-ui/core/Avatar/Avatar";
import {USER_ENTRY_NO_VALUE} from "../../service/generic/UserEntry";
import {Meme, MEME_ENTRY_NO_VALUE} from "../../service/generic/Meme";
import ModalPage from "../ModalPage/ModalPage";
import Waypoint from "react-waypoint";


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
    classes: any,
    open: boolean,
    onRequestClose: () => void,
}, {
    meme: Meme,
    expanded: boolean,
    comments: MemeComment[],
    commentToPost: string,
    logged: boolean,
    loadingComment: boolean,
    displayWaypoint: boolean,
}> {
    state = {
        meme: MEME_ENTRY_NO_VALUE,
        expanded: false,
        comments: [],
        commentToPost: "",
        logged: false,
        loadingComment: false,
        displayWaypoint: true,
    };

    commentVisitor: CommentsVisitor;
    private removeListener: () => void;
    private memeLink: MemeLinkInterface;

    componentDidMount() {
        let meme = this.props.meme;
        if (meme === MEME_ENTRY_NO_VALUE) {
            throw new Error();
        }
        this.memeLink = memeService.getMemeLink(meme.id);
        this.removeListener = authService.onAuthStateChanged((user) => {
            this.setState({
                logged: user != USER_ENTRY_NO_VALUE ? true : false
            });
            this.memeLink.refresh();
        });

        this.memeLink.on(meme => {
            this.setState({
                meme: meme
            });
        });
        this.setState({
            meme: meme
        });
        this.commentVisitor = commentService.getCommentVisitor(meme.id);
        this.commentVisitor.on((comments: MemeComment[]) => {
            let concatResult: MemeComment[] = this.state.comments;
            concatResult=concatResult.concat(comments);
            this.setState({comments: concatResult, loadingComment: false});
        });
        //initialize
        this.commentVisitor.loadMore(3);
    }

    componentWillUnmount() {
        this.removeListener();
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

    renderWaypoint = () => {
        if (this.state.displayWaypoint) {
            return (
                <Waypoint
                    scrollableAncestor={window}
                    onEnter={() => {
                        console.log("loadmore comment");
                        this.commentVisitor.loadMore(10);
                    }}
                />
            );
        }
        return <div></div>
    };

    render() {
        //const {classes} = this.props;
        return <ModalPage title={this.state.meme.title} open={this.props.open}
                          onRequestClose={this.props.onRequestClose}><Card>
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
            </CardActions>
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
                        this.state.comments.map((comment, index, array) => {
                            return <div key={index}>
                                <UserComment key={index} comment={comment}/>
                                {((index == array.length - 5) || (array.length<=5 && index==array.length-1)) &&
                                this.renderWaypoint()
                                }
                            </div>
                        })
                    }
                </div>}
            </CardContent>
        </Card>
        </ModalPage>
    }

}

export default withStyles(styles)(MemeComponent);