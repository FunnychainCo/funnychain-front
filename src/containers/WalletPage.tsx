import * as React from 'react'
import {Component} from 'react'
import UserWallet from "../components/Wallet/UserWallet";
import {backService} from "../service/BackService";

export default class WalletPage extends Component<{
    match: any,
    history: any,
    location: any
}, {}> {

    componentWillMount() {
        //let userid = this.props.match.params.userid;
        //userid = decodeURIComponent(userid);
        //this.setState({userid: userid});
    }

    componentWillUnmount() {
    }

    goBack() {
        //this.props.history.goBack();
        backService.goBack();
    }

    render() {
        return <UserWallet onRequestClose={() => {
            this.goBack()
        }} open={true}></UserWallet>
    }
}
