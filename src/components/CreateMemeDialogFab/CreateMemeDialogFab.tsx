import * as React from 'react'
import {Component} from 'react'
import ContentAdd from '@material-ui/icons/Add';
import {authService} from "../../service/generic/AuthService";
import {USER_ENTRY_NO_VALUE} from "../../service/generic/UserEntry";
import {Link} from 'react-router-dom';
import CreateMemeDialog from "./CreateMemeDialog";
import {backService} from "../../service/BackService";
import Fab from "@material-ui/core/Fab";

export default class CreateMemeDialogFab extends Component<{},{
    open:boolean,
    logged: boolean
}> {
    state = {
        open:false,
        logged: false
    };

    private removeListener: () => void = ()=>{};
    private removeBackListener: ()=>void = ()=>{};

    componentDidMount() {
        this.removeListener = authService.onAuthStateChanged((user) => {
            this.setState({
                logged: user!=USER_ENTRY_NO_VALUE ? true : false
            });
        });
        this.removeBackListener = backService.onBack(() => {
            this.setState({open:false});
        })
    }

    componentWillUnmount() {
        this.removeListener();
        this.removeBackListener();
    }

    render() {
        const PostDialogDisplayLink = (props) => <Link to={"/post"} {...props} />;
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
                <Fab
                    style={style}
                    onClick={()=>{this.setState({open:true})}}
                    component={PostDialogDisplayLink}
                >
                    <ContentAdd/>
                </Fab>
                }
                {this.state.logged &&
                <CreateMemeDialog open={this.state.open} handleClose={()=>{backService.goBack()}}/>
                }
            </div>
        )
    }
}