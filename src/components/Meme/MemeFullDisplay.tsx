import * as React from 'react'
import {Component} from 'react'
import "./Meme.css"
import {CommentsVisitor, MemeLinkInterface} from "../../service/generic/ApplicationInterface";
import Card from "@material-ui/core/Card/Card";
import CardHeader from "@material-ui/core/CardHeader/CardHeader";
import CardActions from "@material-ui/core/CardActions/CardActions";
import CardContent from "@material-ui/core/CardContent/CardContent";
import withStyles from "@material-ui/core/styles/withStyles";
import {authService} from "../../service/generic/AuthService";
import LoadingBlock from "../LoadingBlock/LoadingBlock";
import UserComment from "./UserComment";
import {USER_ENTRY_NO_VALUE} from "../../service/generic/UserEntry";
import {Meme, MEME_ENTRY_NO_VALUE} from "../../service/generic/Meme";
import Waypoint from "react-waypoint";
import {MemeComment} from "../../service/generic/MemeComment";
import CommentPoster from "./CommentPoster";
import MemeAvatarInfo from "./MemeAvatarInfo";
import MemeActionButton from "./MemeActionButton";
import {Helmet} from "react-helmet";

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
            concatResult.sort((a: MemeComment, b: MemeComment) => {
                return b.date.getTime() - a.date.getTime();
            });
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
        return <div className="fcCenteredContainer fcFullWidth">
            <Helmet>
                <meta charSet="utf-8" />
                <title>{this.state.meme.title}</title>
                {/* Meta description */}
                <meta name="Description" content="Be Funny, Make Money!" />
                <meta name="Keywords" content="Meme Blockchain Funnychain" />

                {/* OG Meta description */}
                <meta property="og:title" content={this.state.meme.title} />
                <meta property="og:site_name" content="FunnyChain" />
                <meta property="og:url" content="https://beta.funnychain.co" />
                <meta property="og:description" content="Be Funny, Make Money!"/>
                <meta property="og:type" content="website"/>
                <meta property="og:image" content={this.state.meme.imageUrl}/>

                {/* Twitter Meta description */}
                <meta name="twitter:card" content="Funnychain"/>
                <meta name="twitter:description" content="Be Funny, Make Money!"/>
                <meta name="twitter:title" content={this.state.meme.title}/>
                <meta name="twitter:site" content="@funnychain_lol"/>
                <meta name="twitter:image" content={this.state.meme.imageUrl} />
                <meta name="twitter:creator" content="@funnychain_lol"/>
            </Helmet>
            <Card className="fcCenteredContent fcDynamicWidth">
                <CardHeader
                    style={{"fontSize": "1.5em", "fontWeight": "bold"}}
                    title={this.state.meme.title}
                    disableTypography={true}
                />
                <img className="memeImage" src={this.state.meme.imageUrl} alt=""/>
                <CardActions>
                    <MemeActionButton meme={this.state.meme} memeLink={this.memeLink} logged={this.state.logged}/>
                </CardActions>
                <CardContent style={{marginTop: 0, paddingTop: 0}}>
                    <MemeAvatarInfo meme={this.state.meme}/>
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