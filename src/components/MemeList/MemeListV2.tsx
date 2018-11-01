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
    memesOrder: string[];
    displayWaypoint: boolean
}

export default class MemeListV2 extends Component<{
    type: string
}, State> {
    state: State = {
        memes: {},
        memesOrder: [],
        displayWaypoint: true
    };

    private removeCallbackOnMemeData: (() => void) = () => {
    };
    private removeCallbackOnMemeOrder: (() => void) = () => {
    };

    private memeLoader: MemeLoaderInterface;


    componentWillMount() {
        this.restartMemeLoader(this.props.type, memeService.getTags());
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.type!=this.props.type) {
            this.restartMemeLoader(this.props.type, memeService.getTags());
        }
    }

    restartMemeLoader(type: string, tags: string[]) {
        this.memeLoader = memeService.getMemeLoader(type, tags);
        this.setState({memesOrder: []});//reset meme order
        this.removeCallbackOnMemeData();
        this.removeCallbackOnMemeData = this.memeLoader.onMemeData((meme: MemeLinkInterface) => {
            let tmpState = {};
            tmpState[meme.id] = meme;
            this.setState((state) => ({memes: {...tmpState, ...state.memes}}));//reset view
        });
        this.removeCallbackOnMemeOrder();
        this.removeCallbackOnMemeOrder = this.memeLoader.onMemeOrder((memesKey: string[]) => {
            this.state.memesOrder = this.state.memesOrder.concat(memesKey.reverse());
            this.setState({memesOrder: this.state.memesOrder});//update view
        });
        this.memeLoader.loadMore(5);
    }

    componentWillUnmount() {
        this.removeCallbackOnMemeData();
        this.removeCallbackOnMemeOrder();
    }

    renderWaypoint = (key) => {
        //console.log("create waypoint "+key + " => "+this.state.memes[key].title);
        if (this.state.displayWaypoint) {
            return (
                /*<div style={{minHeight: "100px", width: "100%", backgroundColor: "red"}}>*/
                    <Waypoint
                        key={"waypoint" + key}
                        scrollableAncestor={window}
                        onEnter={() => {
                            console.log("waypoint triggered => load more");
                            this.memeLoader.loadMore(4);
                        }}
                    >
                    </Waypoint>
                /*</div>*/
            );
        } else {
            return <div></div>
        }
    };

    render() {
        return (
            <div className="fcContainerScroll scrollbar">
                <div className="memes fcContentScroll">
                    {
                        this.state.memesOrder.map((memeKey, index, array) => {
                            let mapKey = memeKey;
                            let waypointDistanceFromTheEnd = 4;
                            return <div key={mapKey}>
                                {!this.state.memes[memeKey] && <img className="memeImage"
                                                                    src="/static/image/placeholder-image.png"
                                                                    alt=""/>}
                                {this.state.memes[memeKey] && <MemeComponent meme={this.state.memes[memeKey]}/>}
                                {(this.state.memes[memeKey] && ((index == array.length - waypointDistanceFromTheEnd) || (index == array.length-1))) &&
                                this.renderWaypoint(mapKey)
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