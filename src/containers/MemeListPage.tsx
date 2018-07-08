import {Component} from 'react'
import * as React from 'react'
import MemeListV2 from "../components/MemeList/MemeListV2";
import Header from "../components/Header/Header";
import DialogPage from "./DialogPage/DialogPage";

export default class MemeListPage extends Component<{
    match: any,
    history: any
}, {type:string}> {

    componentWillMount() {
        const match = this.props.match; // coming from React Router.
        /*{isExact:true
        params:{memeid: "toto"}
        path:"/meme/:memeid"
        url:"/meme/toto"}*/
        if(match.path==="/"){
            this.setState({type:"hot"});
        }
        if(match.path==="/hot"){
            this.setState({type:"hot"});
        }
        if(match.path==="/trending"){
            this.setState({type:"trending"});
        }
        if(match.path==="/fresh"){
            this.setState({type:"fresh"});
        }
    }

    render() {
        return (
            <div>
                <DialogPage match={this.props.match} history={this.props.history}/>
                <Header type={this.state.type}/>
                <MemeListV2 type={this.state.type}/>
            </div>
        )
    }
}
