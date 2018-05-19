
import "./MemeList.css"
import {Meme, memeProvider} from "../../service/generic/MemeService";
import MemeComponent from '../Meme/MemeComponent';
import CreateMemeDialogFab from "../CreateMemeDialogFab/CreateMemeDialogFab";
import * as React from "react";
import {Component} from "react";

interface State {
    memes:{[id:string]:Meme}
}

export default class MemeListV2 extends Component {
    state:State = {
        memes: {}
    };
    private removeCallback:()=>void = () => {console.error("no callback to remove")};

    componentDidMount() {
        this.removeCallback = memeProvider.on(
            (memes:Meme[]) => {
                memes.forEach((meme:Meme) => {
                    this.state.memes[meme.id] = meme;
                    this.forceUpdate();
                });
            });
    }

    componentWillUnmount(){
        this.removeCallback();
    }

    getKeyList() {
        var keys = Object.keys(this.state.memes)
        keys = keys.sort((aKey, bKey) => {
            var a = new Date(this.state.memes[aKey].created).getTime();
            var b = new Date(this.state.memes[bKey].created).getTime();
            return b - a;//b-a means reversed
        });
        return keys;
    }

    render() {
        return (
            <div className="fcContainerScroll scrollbar">
                <div className="memes fcContentScroll">
                    {
                        this.getKeyList().map((key) => {
                            if (this.state.memes[key].title === null || this.state.memes[key].title === "") {
                                return <div key={key}></div>
                            }
                            if (this.state.memes[key].imageUrl === null || this.state.memes[key].imageUrl === "") {
                                return <div key={key}></div>
                            }
                            return <MemeComponent key={key} meme={this.state.memes[key]}/>
                        })
                    }
                    <CreateMemeDialogFab/>
                </div>
            </div>
        )
    }

}