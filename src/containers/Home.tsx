import * as React from 'react'
import {Route} from 'react-router-dom'
import MemeDisplayPage from "./MemeDisplayPage";
import MemeListPage from "./MemeListPage";

export default class Home extends React.Component<{
    match: any,
    history: any
}, void,{}> {

    componentWillMount() {
        //const match = this.props.match; // coming from React Router.
        /*{isExact:true
        params:{memeid: "toto"}
        path:"/meme/:memeid"
        url:"/meme/toto"}*/
    }

    render() {
        return (
            <div>
                <Route exact path='/meme/:memeid' component={MemeDisplayPage} />
                <Route exact path='/' component={MemeListPage} />
                <Route exact path='/hot' component={MemeListPage} />
                <Route exact path='/trending' component={MemeListPage} />
                <Route exact path='/fresh' component={MemeListPage} />
                <Route exact path='/home' component={MemeListPage} />
            </div>
        )
    }
}