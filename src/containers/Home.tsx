import {Component} from 'react'
import * as React from 'react'
import MemeListV2 from "../components/MemeList/MemeListV2";
import {Route} from 'react-router-dom'
import MemeDisplayPage from "./MemeDisplayPage";

export default class Home extends Component<{},{}> {
    render() {
        return (
            <div>
                <Route path='/meme/:memeid' component={MemeDisplayPage} />
                <MemeListV2/>
            </div>
        )
    }
}