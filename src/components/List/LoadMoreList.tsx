import * as React from "react";
import {Component} from "react";
import {Waypoint} from "react-waypoint";
import LoadingBlock from "../LoadingBlock/LoadingBlock";
import {isBrowserRenderMode} from "../../service/ssr/windowHelper";
import {ItemLoader, PaginationCursor} from "../../service/concurency/PaginationInterface";
import {idleTaskPoolExecutor} from "../../service/generic/IdleTaskPoolExecutorService";
import {EmoticonExcitedOutline} from "mdi-material-ui";


interface State {
    content: { [id: string]: any };
    contentOrder: string[];
    displayWaypoint: { [id: string]: boolean };
    finalBottom: boolean;
    finalTop: boolean;
}

///

export default class LoadMoreList extends Component<{
    paginationCursor: PaginationCursor<any>,
    itemLoader: ItemLoader<any>,
    element: (key: string, data: any) => any,
    placeHolderElement: (key: any) => any,
    scrollableAncestor: any, // undefined (for modal) or window (for body scroll)
}, State> {
    state: State = {
        content: {},
        contentOrder: [],
        displayWaypoint: {},
        finalBottom: false,
        finalTop: true,
    };

    initialLoadNumber = 10;
    loadMoreNumber = 10;
    waypointDistanceFromTheEnd = 0;
    requestedItem = 0;
    private removeCallback: (() => void) = () => {
    };


    componentWillMount() {
        this.setState({
            content: {},
            contentOrder: [],
            displayWaypoint: {}
        });
        let cancelid = "" + Math.random();
        this.props.paginationCursor.reset();
        this.removeCallback();
        let removeCallbackOnMemeData = this.props.itemLoader.onData((id: string, data: any) => {
            idleTaskPoolExecutor.addTask(() => {
                let tmpState = {};
                tmpState[id] = data;
                this.setState((state) => ({content: {...tmpState, ...state.content}}));//reset view
            }, cancelid);
        });

        let removeCallbackOnMemeOrder = this.props.paginationCursor.onData((memesKey: string, direction: string) => {
            idleTaskPoolExecutor.addTask(() => {
                this.props.itemLoader.requestItem(memesKey);
                this.requestedItem--;
                this.setState((state) => {
                    state.contentOrder.push(memesKey)
                    return {
                        contentOrder: state.contentOrder,
                    }
                });
            }, cancelid);
        });
        let onNewDataAvailableOnNew = this.props.paginationCursor.onNewDataAvailable((number: number, direction: string) => {
            idleTaskPoolExecutor.addTask(() => {
                if (this.requestedItem > 0) {
                    this.props.paginationCursor.loadMore(this.requestedItem);
                }
            }, cancelid);
            this.setState({finalBottom: false});
        });

        let onDataSetCompleted = this.props.paginationCursor.onDataSetCompleted((direction: string) => {
            this.setState({finalBottom: true});
        });

        this.requestMore(this.initialLoadNumber);
        this.removeCallback = () => {
            removeCallbackOnMemeData();
            removeCallbackOnMemeOrder();
            onNewDataAvailableOnNew();
            onDataSetCompleted();
            idleTaskPoolExecutor.cancelGroup(cancelid);
        };
    }

    requestMore(number: number) {
        this.requestedItem += number;
        this.props.paginationCursor.loadMore(number);
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
                        this.requestMore(this.loadMoreNumber);
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
                {!this.state.finalTop && <LoadingBlock key="loading-block-top"/>}
                {
                    this.state.contentOrder.map((memeKey, index, array) => {
                        let mapKey = memeKey;
                        let data = this.state.content[memeKey];
                        return <React.Fragment key={mapKey}>
                            {!this.state.content[memeKey] && this.props.placeHolderElement(mapKey)}
                            {this.state.content[memeKey] && this.props.element(mapKey, data)}

                            {((index == array.length - this.waypointDistanceFromTheEnd - 1) || (index == array.length - 1)) &&
                            this.renderWaypoint(mapKey)
                            }
                        </React.Fragment>
                    })
                }
                {!this.state.finalBottom && <LoadingBlock key="loading-block-bottom"/>}
                {(this.state.finalBottom && this.state.contentOrder.length === 0) &&
                <div key="no-content-block-bottom">
                    <div style={{
                        display: "flex",
                        justifyContent: "center ",
                        alignItems: "center",
                        height: "100px",
                        flexDirection: "column"
                    }}>
                        <EmoticonExcitedOutline fontSize={"large"}/>
                        <div style={{textAlign: "center",}}>I seems you do not have any notifications yet!</div>
                    </div>
                </div>
                }
            </React.Fragment>
        )
    }

}