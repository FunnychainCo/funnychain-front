import * as React from 'react'
import {Component} from 'react'
import {memeService} from "../service/generic/MemeService";
import {MemeLinkInterface} from "../service/generic/ApplicationInterface";
import MemeFullDisplayModal from "../components/Meme/MemeFullDisplayModal";

export default class MemeDisplayPage extends Component<{
    match: any,
    history: any,
    location:any
}, {}> {
    private removeListener: () => void;
    private memeLink: MemeLinkInterface;

    componentWillMount() {
        const match = this.props.match; // coming from React Router.
        /*{isExact:true,params:{memeid: "toto"},path:"/meme/:memeid",url:"/meme/toto"}*/
        let memeID = match.params.memeid;
        memeID = decodeURIComponent(memeID);
        this.memeLink = memeService.getMemeLink(memeID);
        this.removeListener = this.memeLink.on(meme => {
            this.setState({meme: meme});
        });
    }

    componentWillUnmount() {
        this.removeListener();
    }

    goBack() {
        //window.history.back();
        this.props.history.goBack();
    }

    render() {
        return <MemeFullDisplayModal meme={this.memeLink} open={true} onRequestClose={()=>{this.goBack()}}/>
        //return (<MemeFullDisplay meme={this.memeLink}/>)
    }
}
