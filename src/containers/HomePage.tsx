import * as React from 'react'
import {Route} from 'react-router-dom'
import MemeDisplayPage from "./MemeDisplayPage";
import MemeListPage from "./MemeListPage";
import Debug from "./Debug/Debug";
import Connect from "./Steem/Connect";
import BackListener from "./BackListener";

export default class HomePage extends React.Component<any, any> {
    render() {
        return (
            <div>
                <Route path='/' component={BackListener} />
                <Route exact path='/steem/connect' component={Connect}/>
                <Route exact path='/debug' component={Debug}/>

                <Route path='/' component={MemeListPage} />
                <Route path='/meme/:memeid' component={MemeDisplayPage} />

            </div>
        )
    }
}