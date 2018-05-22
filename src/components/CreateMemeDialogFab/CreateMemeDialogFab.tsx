import {Component} from 'react'
import * as React from 'react'
import {Button} from "material-ui";
import ContentAdd from '@material-ui/icons/Add';
import {authService, USER_ENTRY_NO_VALUE} from "../../service/generic/AuthService";
import CreateMemeDialog from "./CreateMemeDialog";


export default class CreateMemeDialogFab extends Component {
    state = {
        open: false,
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

    handleClose = () => {
        this.setState({open: false});
    };

    popupCreateMeme = () => {
        this.setState({open: true});
    };

    render() {
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
                <CreateMemeDialog
                    open={this.state.open}
                    handleClose={this.handleClose}
                />
                {this.state.logged &&
                <Button
                    variant="fab"
                    onClick={this.popupCreateMeme}
                    style={style}>
                    <ContentAdd/>
                </Button>
                }
            </div>
        )
    }
}