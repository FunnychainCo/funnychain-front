import * as React from 'react'
import {Component} from 'react'
import UserMemeList from "../components/MemeList/UserMemeList";

export default class UserMemeListPage extends Component<{
    match: any,
    history: any,
    location:any
}, void> {

    componentWillMount() {
    }

    componentWillUnmount() {
    }


    render() {
        return <UserMemeList onRequestClose={()=>{}} open={true}></UserMemeList>
    }
}
