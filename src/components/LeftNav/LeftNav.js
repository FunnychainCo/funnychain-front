import React, { Component } from 'react'
import { List, ListItem } from "material-ui/List";
import ContentInbox from "material-ui/svg-icons/content/inbox";
import {Link } from 'react-router-dom'
import ActionInfo from "material-ui/svg-icons/action/info";

import { logout } from '../../service/auth'
import { firebaseAuth } from '../../service/firebase'
import Popup from "react-popup";

export default class LeftNav extends Component {
  state = {
      authed: false,
      loading: true,
  }
  componentDidMount () {
      this.removeListener = firebaseAuth().onAuthStateChanged((user) => {
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
      this.removeListener()
  }
  render () {
    return (
        <List style={{width: '260px'}} >
            <Link to="/"><ListItem primaryText="Home" leftIcon={<ActionInfo />} /></Link>
            {this.state.authed &&
                <ListItem
                    primaryText="Logout" leftIcon={<ContentInbox />}
                onClick={() => {logout()}}>
                </ListItem>
            }

            {!this.state.authed &&
                <Link to="/login"><ListItem primaryText="login" leftIcon={<ContentInbox />} /></Link>
            }

            {!this.state.authed &&
                <Link to="/register"><ListItem primaryText="Register" leftIcon={<ContentInbox />} /></Link>
            }

        </List>
    )
  }
}