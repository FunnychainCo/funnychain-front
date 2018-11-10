import {Component} from 'react';
import * as React from 'react';
import IconButton from "@material-ui/core/IconButton/IconButton";
import {Menu} from "@material-ui/icons";

export default class NotLogged extends Component<{
    component:any,
    onDialogLogin:()=>void
},{
    anchorEl:any
}> {
    state = {
        anchorEl:null,
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
                    component={this.props.component}
                    aria-owns={this.state.anchorEl ? 'simple-menu' : ""}
                    aria-haspopup="true"
                    onClick={()=>{this.handleClose();this.props.onDialogLogin();}}
                >
                    <Menu style={{color:"#FFFFFF"}}/>
                </IconButton>
            </div>
        )
    }
}
/**

 <Menu
 id="simple-menu"
 anchorEl={anchorEl}
 anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
 transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
 open={Boolean(this.state.anchorEl)}
 onClose={this.handleClose}
 >
 <MenuItem onClick={()=>{this.handleClose();this.props.onDialogLogin();}}>Login</MenuItem>
 <MenuItem onClick={()=>{this.handleClose();this.props.onDialogRegister();}}>Register</MenuItem>
 </Menu>*/