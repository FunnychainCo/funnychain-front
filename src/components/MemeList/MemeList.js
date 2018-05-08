import React, {Component} from 'react'
import CreateMemeDialogFab from "../CreateMemeDialogFab/CreateMemeDialogFab";
import Meme from "../Meme/Meme";
import "./MemeList.css"
import {memeService} from "../../service/MemeService";

export default class MemeList extends Component {
    state = {
        memes: {}
    };

    componentDidMount() {
        memeService.on((memesValue) => {
            var itemsKeys = Object.keys(memesValue);
            itemsKeys.forEach((key) => {
                var meme = memesValue[key];
                this.state.memes[key] = meme;
                this.forceUpdate();
            });
        });
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
                            if (this.state.memes[key].iid === null || this.state.memes[key].iid === "") {
                                return <div key={key}></div>
                            }
                            return <Meme key={key} meme={this.state.memes[key]}/>
                        })
                    }
                    <CreateMemeDialogFab/>
                </div>
            </div>
        )
    }

}