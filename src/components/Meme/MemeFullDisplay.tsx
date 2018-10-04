import {Component} from 'react'
import "./Meme.css"
import {
    CommentsVisitor,
    MemeLinkInterface
} from "../../service/generic/ApplicationInterface";
import * as React from 'react';
import Card from "@material-ui/core/Card/Card";
import CardHeader from "@material-ui/core/CardHeader/CardHeader";
import CardActions from "@material-ui/core/CardActions/CardActions";
import CardContent from "@material-ui/core/CardContent/CardContent";
import withStyles from "@material-ui/core/styles/withStyles";
import {authService} from "../../service/generic/AuthService";
import LoadingBlock from "../LoadingBlock/LoadingBlock";
import UserComment from "./UserComment";
import * as moment from 'moment';
import Avatar from "@material-ui/core/Avatar/Avatar";
import {USER_ENTRY_NO_VALUE} from "../../service/generic/UserEntry";
import {Meme, MEME_ENTRY_NO_VALUE} from "../../service/generic/Meme";
import Waypoint from "react-waypoint";
import {MemeComment} from "../../service/generic/MemeComment";
import CommentPoster from "./CommentPoster";
import MemeUpvoteButton from "./MemeUpvoteButton";
import MemeBetButton from "./MemeBetButton";


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

class MemeFullDisplay extends Component<{
    meme: MemeLinkInterface,
    classes: any,
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
    private removeListenerMemeLink: () => void;
    private removeListnerCommentVisitor: () => void;

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
                meme: meme
            });
        });
        this.commentVisitor = this.memeLink.getCommentVisitor();
        this.removeListnerCommentVisitor = this.commentVisitor.on((comments: MemeComment[]) => {
            let concatResult: MemeComment[] = this.state.comments;
            concatResult = concatResult.concat(comments);
            this.setState({comments: concatResult, loadingComment: false});
        });
        //initialize
        this.commentVisitor.loadMore(10);
    }

    componentWillUnmount() {
        this.removeListener();
        this.removeListenerMemeLink();
        this.removeListnerCommentVisitor();
    }

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
        return <div className="fcCenteredContainer fcFullWidth"><Card className="fcCenteredContent fcDynamicWidth">
            <CardHeader
                title={this.state.meme.title}
            />
            <img className="memeImage" src={this.state.meme.imageUrl} alt=""/>
            <CardActions className="memeElementStyleDivContainer">
                <MemeUpvoteButton meme={this.state.meme} logged={this.state.logged} onUpvoteConfirmed={() => {
                    this.memeLink.refresh();
                }}/>
                <MemeBetButton meme={this.state.meme} logged={this.state.logged} onBetConfirmed={() => {
                    this.memeLink.refresh();
                }}/>
                <div className="memeElementStyleDiv">$ {this.state.meme.dolarValue.toFixed(2)}</div>
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
                        {moment(this.state.meme.created).fromNow()}
                    </div>
                </div>
                {this.state.loadingComment && <LoadingBlock/>}
                {!this.state.loadingComment && <div>
                    <CommentPoster memeLink={this.props.meme}
                                   onPost={() => {
                                       this.state.meme.commentNumber++;
                                       this.setState({meme: this.state.meme});//update ui
                                   }}
                                   onPostValidated={() => {
                                   }}
                                   onPostCanceled={() => {
                                       this.state.meme.commentNumber++;
                                       this.setState({meme: this.state.meme});//update ui
                                   }}/>
                    {
                        this.state.comments.map((comment, index, array) => {
                            return <div key={index}>
                                <UserComment key={index} comment={comment}/>
                                {((index == array.length - 5) || (array.length <= 5 && index == array.length - 1)) &&
                                this.renderWaypoint()
                                }
                            </div>
                        })
                    }
                </div>}
            </CardContent>
        </Card></div>
    }

}

export default withStyles(styles)(MemeFullDisplay);