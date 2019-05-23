import * as React from 'react'
import {Component} from 'react'
import TextField from "@material-ui/core/TextField/TextField";
import Button from "@material-ui/core/Button/Button";
import {Send} from "@material-ui/icons";
import {authService} from "../../service/generic/AuthService";
import {MemeLinkInterface} from "../../service/generic/ApplicationInterface";
import {USER_ENTRY_NO_VALUE} from "../../service/generic/UserEntry";
import {audit} from "../../service/log/Audit";

interface State {
    logged: boolean,
    commentToPost: string
}

export default class CommentPoster extends Component<{
    memeLink: MemeLinkInterface,
    onPost: () => void,
    onPostValidated: () => void,
    onPostCanceled: () => void
}, State> {

    state: State = {
        logged: false,
        commentToPost: ""
    }
    private removeListener: () => void;

    componentDidMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            this.setState({
                logged: user != USER_ENTRY_NO_VALUE ? true : false
            });
        });
    }

    componentWillUnmount() {
        this.removeListener();
    }

    post = () => {
        this.props.onPost();
        authService.getUserAction().postComment(this.props.memeLink.id, this.state.commentToPost).then(() => {
            this.props.memeLink.refresh();//refresh meme on every action from user
            this.props.memeLink.getCommentVisitor().refresh().then(value => {
                this.props.onPostValidated();
            });
        }).catch(reason => {
            //cancel previous operation
            audit.reportError("post canceled", reason);
            this.props.onPostCanceled();
        });
        this.setState({commentToPost: ""});//errase old comment value
    };

    render() {
        return <React.Fragment>
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
        </React.Fragment>
    }

}