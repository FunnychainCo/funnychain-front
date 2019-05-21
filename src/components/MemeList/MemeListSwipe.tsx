import {memeService} from "../../service/generic/MemeService";
import CreateMemeDialogFab from "../CreateMemeDialogFab/CreateMemeDialogFab";
import * as React from "react";
import {Component} from "react";
import {MemeLinkInterface, MemeLoaderInterface} from "../../service/generic/ApplicationInterface";
import {authService} from "../../service/generic/AuthService";
import {ssrCache} from "../../service/ssr/SSRCache";
import {isBrowserRenderMode} from "../../service/ssr/windowHelper";
import {Meme, MEME_ENTRY_NO_VALUE} from "../../service/generic/Meme";
import SwipeCards from "../Swipe/SwipeCards";
import FullHeightMemeComponent from "../Meme/FullHeightMemeComponent";
import SwipeCardsTouchController from "../Swipe/SwipeCardsTouchController";


interface State {
    promotedMeme: Meme,
    memes: { [id: string]: MemeLinkInterface },
    memesOrder: string[],
    displayWaypoint: boolean,
    currentMemeFromEnd: number,
}

let initialLoadNumber = 5;

export function generateCache(): Promise<any> {
    let promise = new Promise<any>((resolve, reject) => {
        setTimeout(() => {
            resolve({});
        }, 10000);
        let loadNumber = initialLoadNumber;
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
        currentMemeFromEnd: 0,
    };

    private removeCallbackOnMemeData: (() => void) = () => {
    };
    private removeCallbackOnMemeOrder: (() => void) = () => {
    };

    private memeLoader: MemeLoaderInterface;
    private removeListener: () => void = () => {
    };

    memeCacheNumber = 10;


    componentWillMount() {

        let cache = ssrCache.getCache("memelist-hot");
        if (cache) {
            if (cache.loadedMemes) {
                this.setState((state) => {
                    return ({
                        //promotedMeme: cache.loadedMemes[0] ? cache.loadedMemes[0] : MEME_ENTRY_NO_VALUE,
                        memes: {...cache.memes, ...state.memes},
                        memesOrder: cache.memesOrder.reverse()
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
                this.setState({memesOrder: [], currentMemeFromEnd: 0});//reset meme order
            }
            this.state.memesOrder = memesKey.concat(this.state.memesOrder);
            this.setState({memesOrder: this.state.memesOrder});//update view
        });
        this.memeLoader.loadMore(initialLoadNumber);
    }

    componentWillUnmount() {
        this.removeListener();
        this.removeCallbackOnMemeData();
        this.removeCallbackOnMemeOrder();
    }

    nextMeme() {
        this.setState((state) => {
            let newState = {...state};
            newState.currentMemeFromEnd++;
            return newState;
        });
        let remainingMemeToView = (this.state.memesOrder.length - this.state.currentMemeFromEnd);
        let numberToLoad = Math.max(this.memeCacheNumber - remainingMemeToView, 0);
        if (numberToLoad > 0) {
            this.memeLoader.loadMore(numberToLoad);
        }
    }

    /* delta +1 = next -1 previous */
    getCurrentMemeKey(delta: number) {
        let memeKey = this.state.memesOrder[(this.state.memesOrder.length - 1) - (this.state.currentMemeFromEnd + delta)];
        return memeKey;
    }

    memeControllers = {};

    render() {
        const handleSwipeLeft = () => {
            console.log("left");
            this.nextMeme();
        };
        const handleSwipeRight = () => {
            console.log("right");
            this.nextMeme();
        };
        const handleSwipeTop = () => {
            console.log("top");
            this.nextMeme();
        };
        const handleSwipeBottom = () => {
            console.log("bottom");
            this.nextMeme();
        };
        const gestureStart = (ev: any) => {
            let memeKey = this.getCurrentMemeKey(0);
            if (this.memeControllers[memeKey]) {
                this.memeControllers[memeKey].gestureStart(ev);
            }
        };
        const gestureMove = (ev: any) => {
            {
                let memeKey = this.getCurrentMemeKey(0);
                if (this.memeControllers[memeKey]) {
                    this.memeControllers[memeKey].gestureMove(ev);
                }
            }
            {
                let memeKey = this.getCurrentMemeKey(-1);
                if (this.memeControllers[memeKey]) {
                    this.memeControllers[memeKey].gestureMove(ev);
                }
            }
        };
        const tap = (ev: any) => {
            let memeKey = this.getCurrentMemeKey(0);
            if (this.memeControllers[memeKey]) {
                this.memeControllers[memeKey].tap(ev);
            }
        };
        const gestureEnd = (ev: any) => {
            {
                let memeKey = this.getCurrentMemeKey(0);
                if (this.memeControllers[memeKey]) {
                    this.memeControllers[memeKey].gestureEnd(ev);
                }
            }
            {
                let memeKey = this.getCurrentMemeKey(-1);
                if (this.memeControllers[memeKey]) {
                    this.memeControllers[memeKey].gestureEnd(ev);
                }
            }
        };
        return (
            <React.Fragment>
                <div style={{
                    position: "relative",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                }}>
                    <SwipeCardsTouchController gestureStart={gestureStart} gestureMove={gestureMove} tap={tap}
                                               gestureEnd={gestureEnd}>
                        {
                            this.state.memesOrder.map((memeKey, index, array) => {
                                let mapKey = memeKey;
                                //let zindex = index;
                                let currentMemeKey = this.getCurrentMemeKey(0);
                                let previousMemeKey = this.getCurrentMemeKey(-1);
                                let nextMemeKey = this.getCurrentMemeKey(+1);
                                let hidden = memeKey !== currentMemeKey && memeKey !== nextMemeKey;
                                let removed = memeKey !== currentMemeKey && memeKey !== previousMemeKey && memeKey !== nextMemeKey;
                                let removedDiv = removed;
                                return <React.Fragment key={mapKey}>{(!removedDiv) &&
                                <div key={mapKey}
                                     className="fcDynamicWidth"
                                     style={{
                                         //zIndex:zindex,
                                         position: "absolute",
                                         top: "50%",  /* position the top  edge of the element at the middle of the parent */
                                         left: "50%", /* position the left edge of the element at the middle of the parent */
                                         transform: "translate(-50%, -50%)", /* This is a shorthand oftranslateX(-50%) and translateY(-50%) */
                                         visibility: hidden ? "hidden" : "visible",
                                         width: "100%",
                                         height: "100%",
                                         opacity: hidden ? 0 : 1
                                     }}>
                                    {(this.state.memes[memeKey] && !removed) &&
                                    <SwipeCards
                                        key={mapKey}
                                        srcLeft={"https://image.ibb.co/heTxf7/20_status_close_3x.png"}
                                        srcRight={"https://image.ibb.co/dCuESn/Path_3x.png"}
                                        srcTop={"https://image.ibb.co/m1ykYS/rank_army_star_2_3x.png"}
                                        onController={controller => {
                                            this.memeControllers[memeKey] = controller;
                                        }}
                                        onSwipeLeft={handleSwipeLeft}
                                        onSwipeDown={handleSwipeBottom}
                                        onSwipeRight={handleSwipeRight}
                                        onSwipeTop={handleSwipeTop}
                                    >
                                        <FullHeightMemeComponent key={mapKey} meme={this.state.memes[memeKey]}/>
                                    </SwipeCards>
                                    }
                                </div>}
                                </React.Fragment>
                            })
                        }
                    </SwipeCardsTouchController>
                </div>
                <CreateMemeDialogFab/>
            </React.Fragment>
        )
    }

}
