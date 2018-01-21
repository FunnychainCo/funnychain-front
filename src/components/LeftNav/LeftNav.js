import React from "react";
import { List, ListItem } from "material-ui/List";
import ContentInbox from "material-ui/svg-icons/content/inbox";
import ActionGrade from "material-ui/svg-icons/action/grade";
import ContentSend from "material-ui/svg-icons/content/send";
import ContentDrafts from "material-ui/svg-icons/content/drafts";
import Divider from "material-ui/Divider";
import ActionInfo from "material-ui/svg-icons/action/info";

const LeftNav = () => (
  <List style={{width: '260px'}} >
    <ListItem primaryText="Recent" leftIcon={<ContentInbox />} />
    <ListItem primaryText="Livestream" leftIcon={<ActionGrade />} />
    <ListItem primaryText="Memegeist" leftIcon={<ContentSend />} />
    <ListItem primaryText="Leaderboard" leftIcon={<ContentDrafts />} />
    <ListItem primaryText="Blog" leftIcon={<ContentInbox />} />
  </List>
);

export default LeftNav;
