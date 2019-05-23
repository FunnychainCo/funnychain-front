import * as React from 'react';
import {withStyles} from '@material-ui/core/styles';

const styles: any = (theme: any) => ({});

let Hammer: any = null;

class SwipeCardsTouchController extends React.Component<{
    gestureStart: (ev: any) => void,
    gestureMove: (ev: any) => void,
    tap: (ev: any) => void,
    gestureEnd: (ev: any) => void,
    style: any,
    onNext: () => void,
}, {}> {

    private hammertime: any;
    private hammerRemoveListener: () => void = () => {
    };
    private element: any;


    initHammer() {
        if (!Hammer) {
            Hammer = require('hammerjs');
        }
        if (this.hammertime) {
            this.hammertime.destroy();
        }
        this.hammertime = new Hammer.Manager(this.element, {domEvents: false});
        let hammertime = this.hammertime;
        hammertime.add(new Hammer.Pan({direction: Hammer.DIRECTION_ALL, threshold: 2}));
        hammertime.add(new Hammer.Tap({}));
        //let moving = false;
        let panstart = (ev) => {
            if (!ev.isFinal) {
                //moving=true;
                ev.preventDefault();
                this.props.gestureStart(ev);
            }
        };
        hammertime.on("panstart", panstart);
        let panmove = (ev) => {
            ev.preventDefault();
            this.props.gestureMove(ev);
        };
        hammertime.on("panmove", panmove);
        let tap = (ev) => {
            //"/meme/" + encodeURIComponent(this.state.meme.id)
            this.props.tap(ev);
        };
        hammertime.on("tap", tap);
        let panend = (ev) => {
            ev.preventDefault();
            this.props.gestureEnd(ev);
            //moving=false;
        };
        hammertime.on("panend", panend);

        this.hammerRemoveListener();
        this.hammerRemoveListener = () => {
            hammertime.off("panstart", panstart);
            hammertime.off("panmove", panmove);
            hammertime.off("tap", tap);
            hammertime.off("panend", panend);
        }

        /*this.element.addEventListener('mousedown', (ev) => {
            if(moving){
                ev.cancel();
                ev.preventDefault();
            }
        }, false);
        this.element.addEventListener('mouseup', (ev) => {
            if(moving){
                ev.cancel();
                ev.preventDefault();
            }
        }, false);*/

        /*this.element.addEventListener('touchstart', (ev) => {
                this.gestureStart(ev);
        }, false);
        this.element.addEventListener('touchmove', (ev) => {
            this.gestureMove(ev);
        }, false);
        this.element.addEventListener('touchend', (ev) => {
            this.gestureEnd(ev);
        }, false);


        this.element.addEventListener('mousedown', (ev) => {
            this.gestureStart(ev);
        }, false);
        this.element.addEventListener('mousemove', (ev) => {
            this.gestureMove(ev);
        }, false);
        this.element.addEventListener('mouseup', (ev) => {
            this.gestureEnd(ev);
        }, false);
        this.element.addEventListener('mouseout', (ev) => {
            this.gestureEnd(ev);
        }, false);*/
    }

    componentWillUnmount(): void {
        if (this.hammertime) {
            this.hammertime.destroy();
        }
        this.hammerRemoveListener();
    }

    stackedCards(domElement: any) {
        if (this.element == domElement) {
            return;
        }
        this.element = domElement;
        this.initHammer();
    }

    componentDidMount() {
    }

    render() {
        return (
            <div ref={el => {
                if (el) {
                    this.stackedCards(el)
                }
            }}
                 style={{
                     ...{
                         zIndex: 0,
                         position: "absolute",
                         top: 0,
                         left: 0,
                         height: "100%",
                         width: "100%"
                     }, ...this.props.style
                 }}>
                <div style={{zIndex: 1, position: "absolute", top: 0, left: 0, height: "100%", width: "100%"}} onClick={
                    (ev) => {
                        ev.stopPropagation();
                        ev.preventDefault();
                        this.props.onNext();
                    }}>
                    <div
                        style={{zIndex: 2}}
                        onClick={
                            (ev) => {
                                ev.stopPropagation();
                            }}>
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(SwipeCardsTouchController);