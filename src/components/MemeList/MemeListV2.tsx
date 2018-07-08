import "./MemeList.css"
import {memeService} from "../../service/generic/MemeService";
import MemeComponent from '../Meme/MemeComponent';
import CreateMemeDialogFab from "../CreateMemeDialogFab/CreateMemeDialogFab";
import * as React from "react";
import {Component} from "react";
import {MemeLinkInterface, MemeLoaderInterface} from "../../service/generic/ApplicationInterface";
import Waypoint from "react-waypoint";
import LoadingBlock from "../LoadingBlock/LoadingBlock";


interface State {
    memes: { [id: string]: MemeLinkInterface },
    displayWaypoint: boolean
}

export default class MemeListV2 extends Component<{
    type:string
}, State> {
    state:State = {
        memes: {},
        displayWaypoint: true
    };

    private removeCallback: (() => void) = () => {
    };

    private memeLoader: MemeLoaderInterface;


    componentWillMount() {
        this.restartMemeLoader(this.props.type, memeService.getTags());
    }

    restartMemeLoader(type: string, tags: string[]) {
        this.memeLoader = memeService.getMemeLoader(type, tags);
        this.removeCallback();
        this.setState({memes: {}});//reset view
        this.removeCallback = this.memeLoader.on((memes: MemeLinkInterface[]) => {
            let tmpState = {};
            memes.forEach((meme: MemeLinkInterface) => {
                tmpState[meme.id] = meme;
            });
            this.setState((state)=>({memes: {...tmpState,...state.memes}}));//reset view
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

    renderWaypoint = (key) => {
        //console.log("create waypoint "+key + " => "+this.state.memes[key].title);
        //<div style={{minHeight:"100px",backgroundColor:"red"}}></div>
        if (this.state.displayWaypoint) {
            return (
                <Waypoint
                    key = {"waypoint"+key}
                    scrollableAncestor={window}
                    onEnter={() => {
                        console.log("waypoint triggered => load more");
                        this.memeLoader.loadMore(4);
                    }}
                >
                </Waypoint>
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
                            return <div key={key}>
                                <MemeComponent key={key} meme={this.state.memes[key]}/>
                                {((index == array.length - 4) || (index == 0)) &&
                                this.renderWaypoint(key)
                                }
                            </div>
                        })
                    }
                    <LoadingBlock/>
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