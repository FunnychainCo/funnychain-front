import * as React from 'react'
import {Component} from 'react'
import MemeListV2 from "../components/MemeList/MemeListV2";
import Header from "../components/Header/Header";
import DialogPage from "./DialogPage/DialogPage";

export default class MemeListPage extends Component<{
    match: any,
    history: any,
    location:any
}, {type:string}> {

    state:{
        type:""
    };

    componentWillMount() {
        //const match = this.props.match; // coming from React Router.
        /*{isExact:true,params:{memeid: "toto"},path:"/meme/:memeid",url:"/meme/toto"}*/
        const location = this.props.location; // coming from React Router.
        let path = location.pathname;
        if(path==="/hot"){
            this.setState({type:"hot"});
        }else if(path==="/fresh"){
            this.setState({type:"fresh"});
        }else if(path==="/"){
            this.setState({type:"hot"});
        }else {
            this.setState({type:"hot"});
        }
    }

    render() {
        return (
            <div>
                <DialogPage match={this.props.match} history={this.props.history}/>
                <Header type={this.state.type} onTypeChange={(type) => this.setState({type:type})}/>
                <MemeListV2 type={this.state.type}/>
            </div>
        )
    }
}
