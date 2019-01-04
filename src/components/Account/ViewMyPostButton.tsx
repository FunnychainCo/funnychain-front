import * as React from 'react'
import {Component} from 'react'
import "./Account.css";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import DogeIcon from "../Icon/DogeIcon";
import {USER_ENTRY_NO_VALUE, UserEntry} from "../../service/generic/UserEntry";
import {authService} from "../../service/generic/AuthService";
import {Link} from 'react-router-dom';


export default class ViewMyPostButton extends Component<{}, { user: UserEntry }> {
    state = {
        user: USER_ENTRY_NO_VALUE,
    };

    private removeListener: () => void;

    componentWillMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            this.setState({user: user});
        });
    }

    componentWillUnmount() {
        this.removeListener();
    }

    render() {
        let userid = this.state.user.uid;
        const memeListLink = (props) => <Link to={"/user/" + userid + "/meme/list"} {...props} />;
        return (
            <div className="fcContent">
                <ListItem button component={memeListLink} onClick={() => {}}>
                    <DogeIcon/><ListItemText primary="My Memes"/>
                </ListItem>
            </div>
        )
    }
}