import {memeService} from "../../service/generic/MemeService";
import * as React from "react";
import {Component} from "react";
import {MemeLinkInterface, MemeLoaderInterface} from "../../service/generic/ApplicationInterface";
import {authService} from "../../service/generic/AuthService";
import {isBrowserRenderMode} from "../../service/ssr/windowHelper";
import SwipeCards from "../Swipe/SwipeCards";
import FullHeightMemeComponent from "../Meme/FullHeightMemeComponent";
import SwipeCardsTouchController from "../Swipe/SwipeCardsTouchController";
import LoadingBlock from "../LoadingBlock/LoadingBlock";
import {deviceDetector} from "../../service/mobile/DeviceDetector";

let initialLoadNumber = 5;

interface State {
    memes: { [id: string]: MemeLinkInterface },
    memesOrder: string[],
    displayWaypoint: boolean,
    currentMemeFromEnd: number,
    jsLoadedReady: boolean,
}

export default class MemeListSwipe extends Component<{
    type: string
}, State> {
    state: State = {
        memes: {},
        memesOrder: [],
        displayWaypoint: true,
        currentMemeFromEnd: 0,
        jsLoadedReady: false,
    };

    private memeLoaders: {[id:string]:MemeLoaderInterface} = {};
    private memeLoader: MemeLoaderInterface;//current

    private removeListener: () => void = () => {
    };

    memeCacheNumber = 10;
    private mobile: boolean;


    componentWillMount() {
        if (isBrowserRenderMode()) {
            this.restartMemeLoader(this.props.type, memeService.getTags(), false);
        }
        this.mobile = deviceDetector.isMobileRender();
    }

    componentDidMount(): void {
        console.log("ready:"+new Date());
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.type !== this.props.type) {
            this.restartMemeLoader(this.props.type, memeService.getTags(), false);
        }
    }

    restartMemeLoader(type: string, tags: string[], delayedRestart: boolean) {
        if (!delayedRestart) {
            console.log("restart");
            this.setState({memesOrder: [], currentMemeFromEnd: 0});//reset meme order
        }
        if(!this.memeLoaders[type]){
            //create new meme loader
            this.memeLoaders[type] = memeService.getMemeLoader(type, tags);
        }
        this.memeLoader = this.memeLoaders[type];
        this.memeLoader.refresh();

        /////////////////////////////////
        //detach an atach listeners
        /////////////////////////////////
        this.removeListener();
        let removeListenerData = authService.onAuthStateChanged((user) => {
            Object.keys(this.state.memes).forEach(id => {
                this.state.memes[id].refresh();//refresh meme personalized data eg like and invest
            })
        });
        let removeCallbackOnMemeData = this.memeLoader.onMemeData((meme: MemeLinkInterface) => {
            let tmpState = {};
            tmpState[meme.id] = meme;
            this.setState((state) => ({memes: {...tmpState, ...state.memes}}));//reset view
        });
        let resetOrder = true;
        let removeCallbackOnMemeOrder = this.memeLoader.onMemeOrder((memesKey: string[]) => {
            if (resetOrder && delayedRestart) {
                resetOrder = false;
                this.setState({memesOrder: [], currentMemeFromEnd: 0});//reset meme order
            }
            this.state.memesOrder = memesKey.reverse().concat(this.state.memesOrder);
            this.setState({memesOrder: this.state.memesOrder});//update view
        });
        this.removeListener = () =>{
            removeListenerData();
            removeCallbackOnMemeData();
            removeCallbackOnMemeOrder();
        };

        //////////////////////////////////////////
        //load initial
        //////////////////////////////////////////
        this.memeLoader.loadMore(initialLoadNumber);
    }

    componentWillUnmount() {
        this.removeListener();
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

    previousMeme() {
        if(this.state.currentMemeFromEnd>0) {
            let memeKey = this.getCurrentMemeKey(-1);
            if (this.memeControllers[memeKey]) {
                this.memeControllers[memeKey].show();
            }
            this.setState((state) => {
                let newState = {...state};
                newState.currentMemeFromEnd--;
                return newState;
            });
        }
    }

    /* delta +1 = next -1 previous */
    getCurrentMemeKey(delta: number) {
        let memeKey = this.state.memesOrder[(this.state.memesOrder.length - 1) - (this.state.currentMemeFromEnd + delta)];
        return memeKey;
    }

    memeControllers = {};
    moving = false;

    render() {
        const handleSwipeLeft = () => {
            this.nextMeme();
        };
        const handleSwipeRight = () => {
            this.nextMeme();
        };
        const handleSwipeTop = () => {
            this.nextMeme();
        };
        const handleSwipeBottom = () => {
            this.nextMeme();
        };
        const gestureStart = (ev: any) => {
            this.moving = true;
            let memeKey = this.getCurrentMemeKey(0);
            if (this.memeControllers[memeKey]) {
                this.memeControllers[memeKey].gestureStart(ev);
            }
        };
        const gestureMove = (ev: any) => {
            let memeKey = this.getCurrentMemeKey(0);
            if (this.memeControllers[memeKey]) {
                this.memeControllers[memeKey].gestureMove(ev);
            }
        };
        const tap = (ev: any) => {
            let memeKey = this.getCurrentMemeKey(0);
            if (this.memeControllers[memeKey]) {
                this.memeControllers[memeKey].tap(ev);
            }
        };
        const gestureEnd = (ev: any) => {
            let memeKey = this.getCurrentMemeKey(0);
            if (this.memeControllers[memeKey]) {
                this.memeControllers[memeKey].gestureEnd(ev);
            }
            setTimeout(()=>{
                this.moving = false;
            },0);
        };
        const nextMeme = () =>{
            if(!this.moving) {
                this.moving = false;
                let memeKey = this.getCurrentMemeKey(0);
                if (this.memeControllers[memeKey]) {
                    this.memeControllers[memeKey].triggerTop();
                }
            }
        };
        return (
            <React.Fragment>
                <div style={{
                    pointerEvents:"none",
                    position: "relative",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                }}
                >
                    {(!this.state.jsLoadedReady || !this.state.memes[this.getCurrentMemeKey(0)]) &&
                    //JS is not ready of current meme is not loaded yet
                    <LoadingBlock/>
                    }
                    <SwipeCardsTouchController
                        style={{
                            pointerEvents:"auto",}}
                        gestureStart={gestureStart}
                        gestureMove={gestureMove}
                        tap={tap}
                        onNext={nextMeme}
                        gestureEnd={gestureEnd}>
                        {
                            this.state.memesOrder.map((memeKey, index, array) => {
                                let mapKey = memeKey;
                                /*let zindex = index;*/
                                let currentMemeKey = this.getCurrentMemeKey(0);
                                let previousMemeKey = this.getCurrentMemeKey(-1);
                                let nextMemeKey = this.getCurrentMemeKey(+1);
                                let noEvent = memeKey !== currentMemeKey && memeKey !== nextMemeKey;
                                let removed = memeKey !== currentMemeKey && memeKey !== previousMemeKey && memeKey !== nextMemeKey;
                                let hideOnCreate = memeKey === previousMemeKey;
                                return <React.Fragment key={mapKey}>{(!removed) &&
                                <div key={mapKey}
                                     className="fcDynamicWidth"
                                     style={{
                                         //zIndex:zindex,
                                         pointerEvents:noEvent?"none":"auto",
                                         position: "absolute",
                                         top: "50%",  /* position the top  edge of the element at the middle of the parent */
                                         left: "50%", /* position the left edge of the element at the middle of the parent */
                                         transform: "translate(-50%, -50%)", /* This is a shorthand oftranslateX(-50%) and translateY(-50%) */
                                         width: "100%",
                                         height: "100%",
                                     }}>
                                    {(this.state.memes[memeKey] && !removed) &&
                                    <SwipeCards
                                        startHidden={hideOnCreate}
                                        key={mapKey}
                                        srcLeft={"https://image.ibb.co/heTxf7/20_status_close_3x.png"}
                                        srcRight={"https://image.ibb.co/dCuESn/Path_3x.png"}
                                        srcTop={"https://image.ibb.co/m1ykYS/rank_army_star_2_3x.png"}
                                        onController={controller => {
                                            if (!this.state.jsLoadedReady) {
                                                //first controler received means that the card system is ready
                                                this.setState({jsLoadedReady: true});
                                            }
                                            this.memeControllers[memeKey] = controller;
                                        }}
                                        onSwipeLeft={handleSwipeLeft}
                                        onSwipeDown={handleSwipeBottom}
                                        onSwipeRight={handleSwipeRight}
                                        onSwipeTop={handleSwipeTop}
                                    >
                                        <FullHeightMemeComponent
                                            activelink={this.mobile}
                                            onBack = {()=>{this.previousMeme()}}
                                            onMemeClick={nextMeme} key={mapKey} meme={this.state.memes[memeKey]}/>
                                    </SwipeCards>
                                    }
                                </div>}
                                </React.Fragment>
                            })
                        }
                    </SwipeCardsTouchController>
                </div>
                {/*<Fab onClick={()=>{this.previousMeme()}} style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,}}>Back</Fab>*/}
            </React.Fragment>
        )
    }

}
