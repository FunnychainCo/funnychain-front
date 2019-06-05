import * as React from 'react'
import {Component} from 'react'
import NotificationList from "../components/Notification/NotificationList";
import {backService} from "../service/BackService";

export default class NotificationListPage extends Component<{
    match: any,
    history: any,
    location: any
}, { userid: string }> {

    state: {
        userid: ""
    };

    componentWillMount() {
        let userid = this.props.match.params.userid;
        userid = decodeURIComponent(userid);
        this.setState({userid: userid});
    }

    componentWillUnmount() {
    }

    goBack() {
        //this.props.history.goBack();
        backService.goBack();
    }


    render() {
        return <NotificationList userid={this.state.userid} onRequestClose={() => {
            this.goBack()
        }} open={true}></NotificationList>
    }
}
