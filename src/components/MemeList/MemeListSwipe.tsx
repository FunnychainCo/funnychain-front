import {memeService} from "../../service/generic/MemeService";
import CreateMemeDialogFab from "../CreateMemeDialogFab/CreateMemeDialogFab";
import * as React from "react";
import {Component} from "react";
import {MemeLinkInterface, MemeLoaderInterface} from "../../service/generic/ApplicationInterface";
import {authService} from "../../service/generic/AuthService";
import {ssrCache} from "../../service/ssr/SSRCache";
import {isBrowserRenderMode} from "../../service/ssr/windowHelper";
import {Helmet} from "react-helmet";
import {Meme, MEME_ENTRY_NO_VALUE} from "../../service/generic/Meme";
import SwipeCards from "../Swipe/SwipeCards";
import FullHeightMemeComponent from "../Meme/FullHeightMemeComponent";


interface State {
    promotedMeme: Meme,
    memes: { [id: string]: MemeLinkInterface },
    memesOrder: string[],
    displayWaypoint: boolean,
    currentMeme: number,
}

export function generateCache(): Promise<any> {
    let promise = new Promise<any>((resolve, reject) => {
        setTimeout(() => {
            resolve({});
        }, 10000);
        let loadNumber = 5;
        let state: {
            loadedMemes: Meme[],
            memes: { [id: string]: MemeLinkInterface },
            memesOrder: string[],
            memeLinksLoaded: string[],
        } = {
            loadedMemes: [],
            memeLinksLoaded: [],
            memes: {},
            memesOrder: []
        };
        let tryFinishLoad = () => {
            if (
                state.memesOrder.length >= loadNumber &&
                Object.keys(state.memes).length >= loadNumber &&
                state.memeLinksLoaded.length >= loadNumber) {
                removeCallbackOnMemeData();
                removeCallbackOnMemeOrder();
                resolve(state);
            }
        };
        let memeLoader = memeService.getMemeLoader("hot", []);
        let removeCallbackOnMemeData = memeLoader.onMemeData((meme: MemeLinkInterface) => {
            //console.log(meme);
            let tmpState = {};
            tmpState[meme.id] = meme;
            state.memes = {...tmpState, ...state.memes};
            meme.on(meme => {
                state.loadedMemes.push(meme);
                state.memeLinksLoaded.push(meme.id);
                ssrCache.setCache("memelink/" + meme.id, meme);
                tryFinishLoad();
            });
            tryFinishLoad();
        });
        let removeCallbackOnMemeOrder = memeLoader.onMemeOrder((memesKey: string[]) => {
            //console.log(memesKey);
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

export default class MemeListSwipe extends Component<{
    type: string
}, State> {
    state: State = {
        promotedMeme: MEME_ENTRY_NO_VALUE,
        memes: {},
        memesOrder: [],
        displayWaypoint: true,
        currentMeme: 0,
    };

    private removeCallbackOnMemeData: (() => void) = () => {
    };
    private removeCallbackOnMemeOrder: (() => void) = () => {
    };

    private memeLoader: MemeLoaderInterface;
    private removeListener: () => void = () => {
    };

    memeCacheNumber = 3;


    componentWillMount() {

        let cache = ssrCache.getCache("memelist-hot");
        if (cache) {
            if (cache.loadedMemes) {
                this.setState((state) => {
                    return ({
                        //promotedMeme: cache.loadedMemes[0] ? cache.loadedMemes[0] : MEME_ENTRY_NO_VALUE,
                        memes: {...cache.memes, ...state.memes},
                        memesOrder: cache.memesOrder
                    })
                })
            }
        }
        if (isBrowserRenderMode()) {
            this.restartMemeLoader(this.props.type, memeService.getTags(), true);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.type != this.props.type) {
            this.restartMemeLoader(this.props.type, memeService.getTags(), false);
        }
    }

    restartMemeLoader(type: string, tags: string[], delayedRestart: boolean) {
        let resetOrder = true;
        this.removeListener = authService.onAuthStateChanged((user) => {
            Object.keys(this.state.memes).forEach(id => {
                this.state.memes[id].refresh();//refresh meme personalized data eg like and invest
            })
        });
        if (!delayedRestart) {
            this.setState({memesOrder: []});//reset meme order
        }
        this.memeLoader = memeService.getMemeLoader(type, tags);
        this.removeCallbackOnMemeData();
        this.removeCallbackOnMemeData = this.memeLoader.onMemeData((meme: MemeLinkInterface) => {
            let tmpState = {};
            tmpState[meme.id] = meme;
            this.setState((state) => ({memes: {...tmpState, ...state.memes}}));//reset view
        });
        this.removeCallbackOnMemeOrder();
        this.removeCallbackOnMemeOrder = this.memeLoader.onMemeOrder((memesKey: string[]) => {
            if (resetOrder && delayedRestart) {
                resetOrder = false;
                this.setState({memesOrder: [], currentMeme: 0});//reset meme order
            }
            this.state.memesOrder = this.state.memesOrder.concat(memesKey.reverse());
            this.setState({memesOrder: this.state.memesOrder});//update view
        });
        this.memeLoader.loadMore(10);
    }

    componentWillUnmount() {
        this.removeListener();
        this.removeCallbackOnMemeData();
        this.removeCallbackOnMemeOrder();
    }

    nextMeme() {
        this.setState((state) => {
            let newState = {...state};
            newState.currentMeme++;
            return newState;
        });
        //let remainingMemeToView = (this.state.memesOrder.length-this.state.currentMeme);
        //let numberToLoad = this.memeCacheNumber-remainingMemeToView;
        let numberToLoad = 1;
        console.log(numberToLoad);
        if(numberToLoad>0) {
            this.memeLoader.loadMore(numberToLoad);
        }
    }

    render() {
        return (
            <div style={{height:"100%",width:"100%",overflow: "hidden",display: "flex",justifyContent: "center"}}>
                {this.state.promotedMeme !== MEME_ENTRY_NO_VALUE && <Helmet>
                    {/* OG Meta description */}
                    <meta property="og:image" content={this.state.promotedMeme.imageUrl}/>

                    {/* Twitter Meta description */}
                    <meta name="twitter:image" content={this.state.promotedMeme.imageUrl}/>
                </Helmet>
                }
                <div className="fcDynamicWidth fcDynamicHeight">
                    <SwipeCards
                        srcLeft={"https://image.ibb.co/heTxf7/20_status_close_3x.png"}
                        srcRight={"https://image.ibb.co/dCuESn/Path_3x.png"}
                        srcTop={"https://image.ibb.co/m1ykYS/rank_army_star_2_3x.png"}
                        onController={controller => {
                        }}
                        onSwipeLeft={() => {
                            console.log("left");
                            this.nextMeme();
                        }}
                        onSwipeRight={() => {
                            console.log("right");
                            this.nextMeme();
                        }}
                        onSwipeTop={() => {
                            console.log("top");
                            this.nextMeme();
                        }}
                    >
                        {
                            this.state.memesOrder.map((memeKey, index, array) => {
                                let mapKey = memeKey;
                                return <div key={mapKey}>
                                    {!this.state.memes[memeKey] && <img key={mapKey} className="memeImage"
                                                                        src="/static/image/placeholder-image.png"
                                                                        alt=""/>}
                                    {this.state.memes[memeKey] && <FullHeightMemeComponent key={mapKey} meme={this.state.memes[memeKey]}/>}
                                </div>
                            })
                        }
                    </SwipeCards>
                </div>
                <CreateMemeDialogFab/>
            </div>
        )
    }

}