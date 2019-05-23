import * as React from 'react'
import {Component} from 'react'
import {CommentsVisitor, MemeLinkInterface} from "../../service/generic/ApplicationInterface";
import Card from "@material-ui/core/Card/Card";
import CardHeader from "@material-ui/core/CardHeader/CardHeader";
import CardActions from "@material-ui/core/CardActions/CardActions";
import {ChatBubbleOutline} from "@material-ui/icons";
import Button from "@material-ui/core/Button/Button";
import Collapse from "@material-ui/core/Collapse/Collapse";
import CardContent from "@material-ui/core/CardContent/CardContent";
import withStyles from "@material-ui/core/styles/withStyles";
import {authService} from "../../service/generic/AuthService";
import LoadingBlock from "../LoadingBlock/LoadingBlock";
import UserComment from "./UserComment";
import {USER_ENTRY_NO_VALUE} from "../../service/generic/UserEntry";
import {Meme, MEME_ENTRY_NO_VALUE} from "../../service/generic/Meme";
import {Link} from 'react-router-dom';
import {MemeComment} from "../../service/generic/MemeComment";
import CommentPoster from "./CommentPoster";
import MemeAvatarInfo from "./MemeAvatarInfo";
import MemeActionButton from "./MemeActionButton";
import ContentMenuButton from "./ContentMenuButton";
import {ssrCache} from "../../service/ssr/SSRCache";
import {memeService} from "../../service/generic/MemeService";


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


export function generateMemeComponentCache(url: string): Promise<any> {
    let split = url.split("/");
    let memeid = split[split.length - 1];
    let listenOff = () => {
    };
    let promise = new Promise<any>((resolve, reject) => {
        setTimeout(() => {
            resolve({});
        }, 10000);
        let memeLink = memeService.getMemeLink(memeid);
        listenOff = memeLink.on(meme => {
            resolve(meme);
        });
    });
    promise.then(data => {
        listenOff();
        ssrCache.setCache("memelink/" + memeid, data);
    });
    return promise;
}

class FullHeightMemeComponent extends Component<{
    meme: MemeLinkInterface,
    classes: any
    onMemeClick:()=>void
}, State> {
    state: State = {
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

    componentWillMount() {
        let cache = ssrCache.getCache("memelink/" + this.props.meme.id);
        if (cache) {
            this.setState({
                commentNumber: cache.commentNumber,
                meme: cache
            });
        }
    }

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
            concat.sort((a: MemeComment, b: MemeComment) => {
                return a.date.getTime() - b.date.getTime();
            });
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

    handleExpandClick = (ev:any) => {
        ev.stopPropagation();
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
        const MemeDisplayLink = (props) => <Link draggable={false}
                                                 to={"/meme/" + encodeURIComponent(this.state.meme.id)} {...props} />
        return <React.Fragment>
            {!this.state.meme.flag && <Card
                elevation={5}
                style={{
                    marginBottom: "15px",
                    maxHeight: "100%",
                    display: "flex",
                    flexDirection: "column"}}>
                <CardHeader
                    style={{"fontSize": "1.5em", "fontWeight": "bold", justifyContent: "left", width: "100%"}}
                    title={<React.Fragment>
                        <ContentMenuButton contentId={this.state.meme.id}
                                           type={"meme"}
                                           userId={this.state.meme.user.uid}
                                           onClick={(ev:any) => {
                                               ev.stopPropagation();
                                               this.setState((state) => {
                                                   state.meme.flag = true;
                                                   return {meme: state.meme}
                                               });
                                               this.memeLink.refresh();
                                           }}/>
                        {this.state.meme.title}</React.Fragment>}
                    disableTypography={true}
                />
                <ImageFit onClick={this.props.onMemeClick} style={{flexGrow: 1}} src={this.state.meme.imageUrl} />
                <CardActions className="memeElementStyleDivContainer" style={{width: "100%"}}>
                    <MemeActionButton meme={this.state.meme} memeLink={this.memeLink} logged={this.state.logged}/>
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
                <Collapse in={this.state.expanded} timeout="auto" unmountOnExit style={{width: "100%"}}>
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
                            {this.state.commentNumber > this.commentPerPage &&
                            <Button variant="contained" color="primary" fullWidth size="large"
                                    component={MemeDisplayLink}>
                                Show more comment
                            </Button>}
                            {
                                this.getComments().map((comment: MemeComment, index) => {
                                    return <UserComment key={index} comment={comment}/>
                                })
                            }
                        </div>}
                    </CardContent>
                </Collapse>
            </Card>}
        </React.Fragment>
    }

}

class ImageFit extends React.Component<{ src: string,style:any,onClick:()=>void }, {}> {

    public render() {
        return (
            <div
                onClick={this.props.onClick}
                style={{...{
                    minWidth: "100%",
                    /*minHeight: "100%",*/
                    backgroundImage: `url(${this.props.src})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "50% 50%",
                    backgroundColor:"#000000"
                },...this.props.style}} />
        );
    }
}

export default withStyles(styles)(FullHeightMemeComponent);
/*

 */