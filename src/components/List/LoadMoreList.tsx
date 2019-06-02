import * as React from "react";
import {Component} from "react";
import {Waypoint} from "react-waypoint";
import LoadingBlock from "../LoadingBlock/LoadingBlock";
import {isBrowserRenderMode} from "../../service/ssr/windowHelper";
import {ItemLoader, PaginationCursor} from "../../service/concurency/PaginationInterface";


interface State {
    content: { [id: string]: any };
    contentOrder: string[];
    displayWaypoint: { [id: string]: boolean };
    finalBottom:boolean;
    finalTop:boolean;
}

///

export default class LoadMoreList extends Component<{
    paginationCursor: PaginationCursor<any>,
    itemLoader: ItemLoader<any>,
    element: (key: string, data: any) => any,
    placeHolderElement: (key: any) => any,
    scrollableAncestor:any, // undefined (for modal) or window (for body scroll)
}, State> {
    state: State = {
        content: {},
        contentOrder: [],
        displayWaypoint: {},
        finalBottom:false,
        finalTop:true,
    };

    initialLoadNumber = 2;
    loadMoreNumber = 2;
    waypointDistanceFromTheEnd = 0;

    private removeCallback: (() => void) = () => {
    };


    componentWillMount() {
        this.setState({
            content: {},
            contentOrder: [],
            displayWaypoint: {}
        });
        this.props.paginationCursor.reset();
        this.removeCallback();
        let removeCallbackOnMemeData = this.props.itemLoader.onData((id: string, data: any) => {
            let tmpState = {};
            tmpState[id] = data;
            this.setState((state) => ({content: {...tmpState, ...state.content}}));//reset view
        });

        let removeCallbackOnMemeOrder = this.props.paginationCursor.onData((memesKey: string,final:boolean,direction:string) => {
            this.props.itemLoader.requestItem(memesKey);
                this.setState((state) => {
                    if(state.contentOrder.indexOf(memesKey)===-1) {
                        return {
                            contentOrder: state.contentOrder.concat(memesKey),
                            finalBottom:final,
                        }
                    }
                    return null;
                });
        });
        let onNewDataAvailableOnNew = this.props.paginationCursor.onNewDataAvailable((number:number,direction:string) => {
            if(this.state.contentOrder.length < this.initialLoadNumber) {
                this.props.paginationCursor.loadMore(this.initialLoadNumber);
            }
            this.setState({finalBottom:false});
        });
        this.props.paginationCursor.loadMore(this.initialLoadNumber);
        this.removeCallback = () => {
            removeCallbackOnMemeData();
            removeCallbackOnMemeOrder();
            onNewDataAvailableOnNew();
        };
    }

    componentWillUnmount() {
        this.removeCallback();
    }

    renderWaypoint = (key) => {
        //console.log("create waypoint "+key + " => "+this.state.memes[key].title);
        if (!this.state.finalBottom && isBrowserRenderMode()) {
            return (
                /*<div style={{minHeight: "100px", width: "100%", backgroundColor: "red"}}>*/
                    <Waypoint
                        key={"waypoint" + key}
                        scrollableAncestor={this.props.scrollableAncestor}
                        onEnter={() => {
                            //console.log("waypoint triggered => load more");
                            this.props.paginationCursor.loadMore(this.loadMoreNumber);
                        }}
                    >
                    </Waypoint>
                /*</div>*/
            );
        } else {
            /*setTimeout(() => {
                this.setState((state) => {
                    state.displayWaypoint[key] = true;
                    return {displayWaypoint: state.displayWaypoint}
                })
            }, 1000);*/
            return <React.Fragment></React.Fragment>
        }
    };

    render() {
        return (
            <React.Fragment key="fragment">
                {!this.state.finalTop && <LoadingBlock key="loading-block-top"/> }
                {
                    this.state.contentOrder.map((memeKey, index, array) => {
                        let mapKey = memeKey;
                        let data = this.state.content[memeKey];
                        return <React.Fragment key={mapKey}>
                            {!this.state.content[memeKey] && this.props.placeHolderElement(mapKey)}
                            {this.state.content[memeKey] && this.props.element(mapKey, data)}

                            {((index == array.length - this.waypointDistanceFromTheEnd-1) || (index == array.length - 1)) &&
                            this.renderWaypoint(mapKey)
                            }
                        </React.Fragment>
                    })
                }
                {!this.state.finalBottom && <LoadingBlock key="loading-block-bottom"/> }
            </React.Fragment>
        )
    }

}