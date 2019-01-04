import * as React from 'react'
import {Component} from 'react'
import UserMemeList from "../components/MemeList/UserMemeList";

export default class UserMemeListPage extends Component<{
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
        this.props.history.goBack();
    }


    render() {
        return <UserMemeList userid={this.state.userid} onRequestClose={() => {
            this.goBack()
        }} open={true}></UserMemeList>
    }
}
