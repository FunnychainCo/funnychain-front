import * as React from 'react'
import {Component} from 'react'
import "./Account.css";
import {Discord, Face, Facebook, HelpCircle, Medium, Twitter,CommentAccountOutline} from 'mdi-material-ui'; //https://materialdesignicons.com/
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";


export default class ExternalLinkAccount extends Component<{}, {}> {
    state = {};

    componentWillMount() {
    }

    componentWillUnmount() {
    }

    render() {
        return (

            <div className="fcContent">
                <ListItem button component={(props) => <a href="https://funnychain.co" {...props} />}>
                    <Face/><ListItemText primary="Funnychain"/>
                </ListItem>

                <ListItem button
                          component={(props) => <a href="https://www.facebook.com/groups/funnychain/" {...props} />}>
                    <Facebook/><ListItemText primary="Facebook"/>
                </ListItem>

                <ListItem button component={(props) => <a href="https://twitter.com/funnychain_co" {...props} />}>
                    <Twitter/><ListItemText primary="Twitter"/>
                </ListItem>

                <ListItem button component={(props) => <a href="https://discordapp.com/invite/5G2ECV6" {...props} />}>
                    <Discord/><ListItemText primary="Join on discord"/>
                </ListItem>

                {/**<ListItem button
                          component={(props) => <a href="https://t.me/joinchat/G6O10E0dEZnSRFLycDgKjw" {...props} />}>
                    <Telegram/><ListItemText primary="Telegram"/>
                </ListItem>

                <ListItem button component={(props) => <a href="https://www.reddit.com/r/FunnyChain" {...props} />}>
                    <Reddit/><ListItemText primary="Reddit"/>
                </ListItem>**/}

                <ListItem button component={(props) => <a href="https://medium.com/@funnychain" {...props} />}>
                    <Medium/><ListItemText primary="Medium"/>
                </ListItem>

                <ListItem button
                          component={(props) => <a href="https://funnychain.typeform.com/to/VS9XlS" {...props} />}>
                    <CommentAccountOutline/><ListItemText primary="Feedback"/>
                </ListItem>

                <ListItem button component={(props) => <a href="https://medium.com/@funnychain/funnychain-faq-cff33aab1bcc" {...props} />}>
                    <HelpCircle/><ListItemText primary="FAQ"/>
                </ListItem>

            </div>
        )
    }
}