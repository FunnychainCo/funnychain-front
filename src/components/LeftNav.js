import React, { Component } from 'react'
import { List, ListItem } from "material-ui/List";
import ContentInbox from "material-ui/svg-icons/content/inbox";
import ActionGrade from "material-ui/svg-icons/action/grade";
import ContentSend from "material-ui/svg-icons/content/send";
import ContentDrafts from "material-ui/svg-icons/content/drafts";
import { Route, BrowserRouter, Link, Redirect, Switch } from 'react-router-dom'
import Divider from "material-ui/Divider";
import ActionInfo from "material-ui/svg-icons/action/info";

import { logout } from '../service/auth'
import { firebaseAuth } from '../service/firebase'
import Login from '../containers/Login'
import Register from '../containers/Register'

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
            <Link to="/create"><ListItem primaryText="Create" leftIcon={<ActionInfo />} /></Link>
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