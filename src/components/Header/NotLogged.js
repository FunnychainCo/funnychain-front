import React, {Component} from 'react';
import {IconButton, Menu, MenuItem} from "material-ui";
import MoreVertIcon from '@material-ui/icons/MoreVert';

export default class NotLogged extends Component {
    state = {
        anchorEl: null,
    };

    handleClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    render() {
        return (
            <div>
                <IconButton
                    aria-owns={this.state.anchorEl ? 'simple-menu' : null}
                    aria-haspopup="true"
                    onClick={this.handleClick}
                >
                    <MoreVertIcon/>
                </IconButton>
                <Menu
                    id="simple-menu"
                    anchorEl={this.state.anchorEl}
                    open={Boolean(this.state.anchorEl)}
                    onClose={this.handleClose}
                >
                    <MenuItem onClick={()=>{this.handleClose();this.props.onDialogLogin();}}>Login</MenuItem>
                    <MenuItem onClick={()=>{this.handleClose();this.props.onDialogRegister();}}>Register</MenuItem>
                </Menu>
            </div>
        )
    }
}
