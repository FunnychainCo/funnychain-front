import {memeService} from "../../service/generic/MemeService";
import MemeComponent from '../Meme/MemeComponent';
import CreateMemeDialogFab from "../CreateMemeDialogFab/CreateMemeDialogFab";
import * as React from "react";
import {Component} from "react";
import {MemeLinkInterface, MemeLoaderInterface} from "../../service/generic/ApplicationInterface";
import {Waypoint} from "react-waypoint";
import LoadingBlock from "../LoadingBlock/LoadingBlock";
import {authService} from "../../service/generic/AuthService";
import {ssrCache} from "../../service/ssr/SSRCache";
import {isBrowserRenderMode} from "../../service/ssr/windowHelper";


interface State {
    memes: { [id: string]: MemeLinkInterface },
    memesOrder: string[];
    displayWaypoint: boolean
}

export function generateCache(): Promise<any> {
    let promise = new Promise<any>((resolve, reject) => {
        setTimeout(() => {
            resolve({});
        }, 10000);
        let loadNumber = 5;
        let state: {
            memes: { [id: string]: MemeLinkInterface },
            memesOrder: string[],
            memeLinksLoaded: string[],
        } = {
            memeLinksLoaded: [],
            memes: {},
            memesOrder: []
        };
        let tryFinishLoad = () => {
            if (
                state.memesOrder.length >= loadNumber &&
                Object.keys(state.memes).length >= loadNumber &&
                state.memeLinksLoaded.length>=loadNumber) {
                removeCallbackOnMemeData();
                removeCallbackOnMemeOrder();
                resolve(state);
            }
        };
        let memeLoader = memeService.getMemeLoader("hot", []);
        let removeCallbackOnMemeData = memeLoader.onMemeData((meme: MemeLinkInterface) => {
            console.log(meme);
            let tmpState = {};
            tmpState[meme.id] = meme;
            state.memes = {...tmpState, ...state.memes};
            meme.on(meme => {
                state.memeLinksLoaded.push(meme.id);
                ssrCache.setCache("memelink/"+meme.id, meme);
                tryFinishLoad();
            });
            tryFinishLoad();
        });
        let removeCallbackOnMemeOrder = memeLoader.onMemeOrder((memesKey: string[]) => {
            console.log(memesKey);
            state.memesOrder = state.memesOrder.concat(memesKey.reverse());
            tryFinishLoad();
        });
        memeLoader.loadMore(loadNumber);
    });
    promise.then(data => {
        ssrCache.setCache("memelist-hot", data);
    });
    return promise;
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
    private removeListener: () => void = () => {
    };


    componentWillMount() {

        let cache = ssrCache.getCache("memelist-hot");
        if (cache) {
            this.setState((state) => {
                return ({
                    memes: {...cache.memes, ...state.memes},
                    memesOrder: cache.memesOrder
                })
            })
        }else {
            this.restartMemeLoader(this.props.type, memeService.getTags());
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.type != this.props.type) {
            this.restartMemeLoader(this.props.type, memeService.getTags());
        }
    }

    restartMemeLoader(type: string, tags: string[]) {
        this.removeListener = authService.onAuthStateChanged((user) => {
            Object.keys(this.state.memes).forEach(id => {
                this.state.memes[id].refresh();//refresh meme personalized data eg like and invest
            })
        });
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
        this.removeListener();
        this.removeCallbackOnMemeData();
        this.removeCallbackOnMemeOrder();
    }

    renderWaypoint = (key) => {
        //console.log("create waypoint "+key + " => "+this.state.memes[key].title);
        if (this.state.displayWaypoint && isBrowserRenderMode()) {
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
                                {(this.state.memes[memeKey] && ((index == array.length - waypointDistanceFromTheEnd) || (index == array.length - 1))) &&
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