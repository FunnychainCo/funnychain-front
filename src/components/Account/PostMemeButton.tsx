import * as React from 'react'
import {Component} from 'react'
import ListItem from "@material-ui/core/ListItem";
import {PlusCircle} from 'mdi-material-ui'; //https://materialdesignicons.com/
import {Link} from 'react-router-dom';
import Button from "@material-ui/core/Button/Button";


export default class PostMemeButton extends Component<{}, {}> {
    state = {};

    render() {
        const link = (props) => <Link to={"/post"} {...props} />;
        return (
            <div className="fcContent">
                <ListItem button color={"secondary"} component={link} onClick={() => {}}>
                    <Button fullWidth variant="contained" color="secondary">
                        <PlusCircle/>&nbsp;&nbsp;Post a Meme
                    </Button>
                </ListItem>
            </div>
        )
    }
}