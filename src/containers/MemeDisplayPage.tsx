import {Component} from 'react'
import * as React from 'react'
import {memeService} from "../service/generic/MemeService";
import {Meme, MEME_ENTRY_NO_VALUE} from "../service/generic/Meme";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import MemeFullDisplay from "../components/Meme/MemeFullDisplay";
import ModalPage from "../components/ModalPage/ModalPage";

export default class MemeDisplayPage extends Component<{
    match: any,
    history:any
}, {
    meme: Meme
}> {
    state = {
        meme: MEME_ENTRY_NO_VALUE
    };
    private removeListener: () => void;

    componentDidMount() {
        const match = this.props.match; // coming from React Router.
        /*{isExact:true
        params:{memeid: "toto"}
        path:"/meme/:memeid"
        url:"/meme/toto"}*/
        let memeID = match.params.memeid;
        memeID = decodeURIComponent(memeID);
        this.removeListener = memeService.getMemeLink(memeID).on(meme => {
            this.setState({meme: meme});
        });
    }

    componentWillUnmount() {
        this.removeListener();
    }

    goBack(){
        //window.history.back();
        this.props.history.goBack();
    }

    render() {
        return (
            <div>
                {this.state.meme != MEME_ENTRY_NO_VALUE &&
                <MemeFullDisplay meme={this.state.meme} open={true} onRequestClose={() => {
                    this.goBack();
                }}/>}
                {this.state.meme == MEME_ENTRY_NO_VALUE &&
                <ModalPage title="loading" open={true} onRequestClose={() => {
                    this.goBack();
                }}><CircularProgress/></ModalPage>}
            </div>

        )
    }
}
