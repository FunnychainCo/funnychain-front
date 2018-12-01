import * as React from 'react'
import {Component} from 'react'
import PostPage from "./PostPage";
import {Route} from 'react-router-dom'
import AccountDrawerPage from "./AccountDrawerPage";
import LoginPage from "./LoginPage";

export default class DialogPage extends Component<{
    match: any,
    history: any
}, {}> {

    goBack() {
        //window.history.back();
        this.props.history.goBack();
    }

    render() {
        return (<div>
            <Route path={this.props.match.path+'/account'} component={AccountDrawerPage}/>
            <Route path={this.props.match.path+'/post'} component={PostPage}/>
            <Route path={this.props.match.path+'/login'} component={LoginPage}/>
        </div>)
    }
}
