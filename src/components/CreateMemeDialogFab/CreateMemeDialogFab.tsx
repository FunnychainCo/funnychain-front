import {Component} from 'react'
import * as React from 'react'
import ContentAdd from '@material-ui/icons/Add';
import {authService} from "../../service/generic/AuthService";
import Button from "@material-ui/core/Button/Button";
import {USER_ENTRY_NO_VALUE} from "../../service/generic/UserEntry";
import { Link } from 'react-router-dom';

declare var window:any;

export default class CreateMemeDialogFab extends Component {
    state = {
        logged: false
    };

    private removeListener: () => void;

    componentDidMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            this.setState({
                logged: user!=USER_ENTRY_NO_VALUE ? true : false
            });
        })
    }

    componentWillUnmount() {
        this.removeListener();
    }

    render() {
        const PostDialogDisplayLink = (props) => <Link to={window.location.pathname+"/post"} {...props} />;
        const style:any = {
            margin: 0,
            top: 'auto',
            right: 20,
            bottom: 20,
            left: 'auto',
            position: 'fixed',
        };
        return (
            <div>
                {this.state.logged &&
                <Button
                    variant="fab"
                    style={style}
                    component={PostDialogDisplayLink}
                >
                    <ContentAdd/>
                </Button>
                }
            </div>
        )
    }
}