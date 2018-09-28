import {Component} from 'react'
import * as React from 'react'
import "./Account.css";
import { Telegram, Facebook, Twitter, Reddit,Medium, Face,HelpCircle,Discord } from 'mdi-material-ui';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
//https://materialdesignicons.com/

export default class ExternalLinkAccount extends Component<{}, {
}> {
    state = {
    };

    componentWillMount(){
    }

    componentWillUnmount() {
    }

    render() {
        return (

            <div className="fcContent">

                <ListItem button onClick={() => {
                    window.location.href = "https://discord.gg/9NmfPXc"
                }}><Discord/><ListItemText primary="Join on discord"/>
                </ListItem>

                <ListItem button onClick={() => {
                    window.location.href = "https://funnychain.co"
                }}><Face/><ListItemText primary="Funnychain"/>
                </ListItem>

                <ListItem button onClick={() => {
                    window.location.href = "https://medium.com/p/cff33aab1bcc/edit"
                }}><HelpCircle/><ListItemText primary="FAQ"/>
                </ListItem>

                <ListItem button onClick={() => {
                    window.location.href = "https://funnychain.typeform.com/to/VS9XlS"
                }}><HelpCircle/><ListItemText primary="Feedback"/>
                </ListItem>

                <ListItem button onClick={() => {
                    window.location.href = "https://twitter.com/funnychain_lol"
                }}><Twitter/><ListItemText primary="Twitter"/>
                </ListItem>

                <ListItem button onClick={() => {
                    window.location.href = "https://medium.com/@funnychain"
                }}><Medium/><ListItemText primary="Medium"/>
                </ListItem>

                <ListItem button onClick={() => {
                    window.location.href = "https://t.me/joinchat/G6O10E0dEZnSRFLycDgKjw"
                }}><Telegram/><ListItemText primary="Telegram"/>
                </ListItem>

                <ListItem button onClick={() => {
                    window.location.href = "https://www.facebook.com/groups/funnychain/"
                }}><Facebook/><ListItemText primary="Facebook"/>
                </ListItem>

                <ListItem button onClick={() => {
                    window.location.href = "https://www.reddit.com/r/FunnyChain"
                }}><Reddit/><ListItemText primary="Reddit"/>
                </ListItem>

            </div>
        )
    }
}