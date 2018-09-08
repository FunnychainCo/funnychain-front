import {Component} from 'react'
import * as React from 'react'
import "./Account.css";
import { Ethereum } from 'mdi-material-ui';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
//https://materialdesignicons.com/

export default class WalletAccount extends Component<{}, {
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
                <ListItem ><Ethereum /><ListItemText primary={(Math.random()*1.00).toFixed(2) +"ETH"} /></ListItem>
            </div>
        )
    }
}