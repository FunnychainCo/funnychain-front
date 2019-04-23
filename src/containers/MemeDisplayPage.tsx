import * as React from 'react'
import {Component} from 'react'
import {memeService} from "../service/generic/MemeService";
import {MemeLinkInterface} from "../service/generic/ApplicationInterface";
import MemeFullDisplayModal from "../components/Meme/MemeFullDisplayModal";
import {Helmet} from "react-helmet";
import {ssrCache} from "../service/ssr/SSRCache";
import {MEME_ENTRY_NO_VALUE} from "../service/generic/Meme";

export default class MemeDisplayPage extends Component<{
    match: any,
    history: any,
    location:any
}, {}> {
    private removeListener: () => void;
    private memeLink: MemeLinkInterface;
    state={
        meme:MEME_ENTRY_NO_VALUE
    }

    componentWillMount() {
        const match = this.props.match; // coming from React Router.
        /*{isExact:true,params:{memeid: "toto"},path:"/meme/:memeid",url:"/meme/toto"}*/
        let memeID = match.params.memeid;
        memeID = decodeURIComponent(memeID);
        this.memeLink = memeService.getMemeLink(memeID);
        let cache = ssrCache.getCache("memelink/"+memeID);
        if(cache){
            console.log("MEME CHACHE")
            this.setState({
                meme: cache
            });
        }
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
        return <React.Fragment>
            <Helmet>
                <title>{this.state.meme.title}</title>
                {/* Meta description */}
                <meta name="Description" content="Be Funny, Make Money!" />

                {/* OG Meta description */}
                <meta property="og:title" content={this.state.meme.title} />
                <meta property="og:description" content="Be Funny, Make Money!"/>
                <meta property="og:image" content={this.state.meme.imageUrl}/>

                {/* Twitter Meta description */}
                <meta name="twitter:description" content="Be Funny, Make Money!"/>
                <meta name="twitter:title" content={this.state.meme.title}/>
                <meta name="twitter:image" content={this.state.meme.imageUrl} />
            </Helmet>
            <MemeFullDisplayModal meme={this.memeLink} open={true} onRequestClose={()=>{this.goBack()}}/>
        </React.Fragment>;
        //return (<MemeFullDisplay meme={this.memeLink}/>)
    }
}
