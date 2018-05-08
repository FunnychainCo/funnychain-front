import React, { Component } from 'react'
import { ListItem } from "material-ui/List";
import ContentInbox from "material-ui/svg-icons/content/inbox";
import {Link } from 'react-router-dom'
import ActionInfo from "material-ui/svg-icons/action/info";
import {Drawer, MenuItem} from "material-ui";
import {leftMenuService} from "../../service/LeftMenuService";
import {authService} from "../../service/AuthService";

export default class LeftNav extends Component {
  state = {
      authed: false,
      loading: true,
      open:false
  }
  removeListener=null;
  componentDidMount () {
      leftMenuService.registerOpeningCallBack(()=>{
          this.setState({open: true})
      })
      this.removeListener = authService.onAuthStateChanged((user) => {
          if (user) {
              this.setState({
                  authed: true,
                  loading: false,
              })
          } else {
              this.setState({
                  authed: false,
                  loading: false
              })
          }
      })
  }
  componentWillUnmount () {
      this.removeListener();
  }

  handleToggle = () => this.setState({open: !this.state.open});

  handleClose = () => this.setState({open: false});

  render () {
    return (

        <Drawer
            docked={false}
            width={200}
            open={this.state.open}
            onRequestChange={(open) => this.setState({open})}
        >
            <MenuItem onClick={this.handleClose}>Menu Item</MenuItem>
            <Link to="/"><ListItem primaryText="Home" leftIcon={<ActionInfo />} /></Link>
            {this.state.authed &&
                <ListItem
                    primaryText="Logout" leftIcon={<ContentInbox />}
                onClick={() => {authService.logout()}}>
                </ListItem>
            }

            {!this.state.authed &&
                <Link to="/login"><ListItem primaryText="login" leftIcon={<ContentInbox />} /></Link>
            }

            {!this.state.authed &&
                <Link to="/register"><ListItem primaryText="Register" leftIcon={<ContentInbox />} /></Link>
            }
        </Drawer>
    )
  }
}