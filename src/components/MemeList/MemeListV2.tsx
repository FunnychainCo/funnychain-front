
import "./MemeList.css"
import {memeService} from "../../service/generic/MemeService";
import MemeComponent from '../Meme/MemeComponent';
import CreateMemeDialogFab from "../CreateMemeDialogFab/CreateMemeDialogFab";
import * as React from "react";
import {Component} from "react";
import Divider from "@material-ui/core/Divider/Divider";
import {Meme} from "../../service/generic/ApplicationInterface";
import {
    InfiniteLoader,
    List
} from "react-virtualized";

interface State {
    memes:{[id:string]:Meme}
}

export default class MemeListV2 extends Component {
    state:State = {
        memes: {}
    };
    private removeCallback:()=>void = () => {console.error("no callback to remove")};

    componentDidMount() {
        this.removeCallback = memeService.on(
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

    /////
    /////
    /////
    // This example assumes you have a way to know/load this information
    remoteRowCount=0;

    list:any[] = [];

    isRowLoaded ({ index }) {
        return !!this.list[index];
    }

    loadMoreRows ({ startIndex, stopIndex }) {
        return new Promise((resolve, reject) => {
            setTimeout(()=>{
                for (let i = startIndex; i < stopIndex; i++) {
                    this.list.push("txt"+i);
                }
            },1000);
            resolve("ok");
        });
    }

    rowRenderer ({ key, index, style}) {
        return (
            <div
                key={key}
                style={style}
            >
                {this.list[index]}
            </div>
        )
    }

    ////
    ////
    ////

    render() {
        return (
            false?<div className="fcContainerScroll scrollbar">
                <div className="memes fcContentScroll">
                    {
                        this.getKeyList().map((key) => {
                            if (this.state.memes[key].title === null || this.state.memes[key].title === "") {
                                return <div key={key}></div>
                            }
                            if (this.state.memes[key].imageUrl === null || this.state.memes[key].imageUrl === "") {
                                return <div key={key}></div>
                            }
                            return <div key={key}>
                                <MemeComponent key={key} meme={this.state.memes[key]}/>
                                <Divider />
                            </div>
                        })
                    }
                    <CreateMemeDialogFab/>
                </div>
            </div>
                :
                <div>
                    <InfiniteLoader
                        isRowLoaded={this.isRowLoaded}
                        loadMoreRows={this.loadMoreRows}
                        rowCount={this.remoteRowCount}
                    >
                        {({ onRowsRendered, registerChild }) => (
                            <List
                                height={200}
                                onRowsRendered={onRowsRendered}
                                ref={registerChild}
                                rowCount={this.remoteRowCount}
                                rowHeight={20}
                                rowRenderer={this.rowRenderer}
                                width={300}
                            />
                        )}
                    </InfiniteLoader>,
                </div>
        )
    }

}