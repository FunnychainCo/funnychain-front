import * as React from 'react'
import {Route} from 'react-router-dom'
import MemeDisplayPage from "./MemeDisplayPage";
import MemeListPage from "./MemeListPage";
import Debug from "./Debug/Debug";
import Connect from "./Steem/Connect";
import RedirectPage from "./RedirectPage";

export default class HomePage extends React.Component<any, any> {
    render() {
        return (
            <div>
                <Route path='/steem/connect' component={Connect}/>
                <Route exact path='/debug' component={Debug}/>

                <Route path='/meme/:memeid' component={MemeDisplayPage} />

                <Route path='/hot' component={MemeListPage} />
                <Route path='/trending' component={MemeListPage} />
                <Route path='/fresh' component={MemeListPage} />

                <Route exact path='/' component={RedirectPage} />
            </div>
        )
    }
}