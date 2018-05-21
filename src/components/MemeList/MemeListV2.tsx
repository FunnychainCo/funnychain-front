import "./MemeList.css"
import {memeService} from "../../service/generic/MemeService";
import MemeComponent from '../Meme/MemeComponent';
import CreateMemeDialogFab from "../CreateMemeDialogFab/CreateMemeDialogFab";
import * as React from "react";
import {Component} from "react";
import Divider from "@material-ui/core/Divider/Divider";
import {Meme, MemeLoaderInterface} from "../../service/generic/ApplicationInterface";
import Waypoint from "react-waypoint";


interface State {
    memes: { [id: string]: Meme },
    displayWaypoint: boolean
}

export default class MemeListV2 extends Component<any, State> {
    state = {
        memes: {},
        displayWaypoint: true
    };

    private removeCallback: (() => void) = () => {
        console.error("no callback to remove")
    };

    private memeLoader: MemeLoaderInterface;


    componentDidMount() {
        this.memeLoader = memeService.getMemeLoader("trending", ["dmania"]);
        this.removeCallback = this.memeLoader.on((memes: Meme[]) => {
            memes.forEach((meme: Meme) => {
                this.state.memes[meme.id] = meme;
            });
            this.forceUpdate();
        });
        this.memeLoader.loadMore(10);
    }

    componentWillUnmount() {
        this.removeCallback();
    }

    getKeyList() {
        let keys = Object.keys(this.state.memes)
        keys = keys.sort((aKey, bKey) => {
            /*let a = new Date(this.state.memes[aKey].created).getTime();
            let b = new Date(this.state.memes[bKey].created).getTime();
            return b - a;//b-a means reversed*/
            let a = this.state.memes[aKey].order;
            let b = this.state.memes[bKey].order;
            return a - b;
        });
        return keys;
    }

    renderWaypoint = () => {
        if (this.state.displayWaypoint) {
            return (
                <Waypoint
                    onEnter={() => {
                        this.memeLoader.loadMore(4);
                    }}
                />
            );
        }
        return <div></div>
    };

    render() {
        return (
            <div className="fcContainerScroll scrollbar">
                <div className="memes fcContentScroll">
                    {
                        this.getKeyList().map((value, index, array) => {
                            let key = value;
                            if (this.state.memes[key].title === null || this.state.memes[key].title === "") {
                                return <div key={key}></div>
                            }
                            if (this.state.memes[key].imageUrl === null || this.state.memes[key].imageUrl === "") {
                                return <div key={key}></div>
                            }
                            return <div key={key}>
                                <MemeComponent key={key} meme={this.state.memes[key]}/>
                                <Divider/>
                                {index == array.length - 2 &&
                                this.renderWaypoint()
                                }
                            </div>
                        })
                    }
                    <CreateMemeDialogFab/>
                </div>
            </div>
        )
    }

}

/**
 *
 *
 * import {
    InfiniteLoader,
    List,
    WindowScroller
} from "react-virtualized";
 *     /////
 /////
 /////

 list: any = {};
 // This example assumes you have a way to know/load this information
 remoteRowCount = 100000;


 isRowLoaded = ({index}) => {
        return !!this.list[index + ""];
    }

 loadMoreRows = ({startIndex, stopIndex}) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                for (let i = startIndex; i <= stopIndex; i++) {
                    this.list[i + ""] = "txt" + i;
                }
                resolve("ok");
            }, 1000);
        });
    }

 rowRenderer = ({key, index, style}) => {
        return (
            <div
                key={key}
                style={style}
            >
                {this.list[index + ""]}
            </div>
        )
    }

 ////
 ////
 ////
 * <div>
 <InfiniteLoader
 isRowLoaded={this.isRowLoaded}
 loadMoreRows={this.loadMoreRows}
 rowCount={this.remoteRowCount}
 >
 {({onRowsRendered, registerChild}) => (
     <WindowScroller ref={registerChild}>
         {({height, isScrolling, registerChild, scrollTop}) => (
             <List
                 autoHeight
                 height={height}
                 onRowsRendered={onRowsRendered}
                 ref={registerChild}
                 rowCount={this.remoteRowCount}
                 rowHeight={20}
                 rowRenderer={this.rowRenderer}
                 style={{width:"100%"}}
             />
         )}
     </WindowScroller>
 )}
 </InfiniteLoader>
 </div>
 */