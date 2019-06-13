import * as React from 'react';
import {withStyles} from '@material-ui/core/styles';

const styles: any = (theme: any) => ({});

class SwipeCards extends React.Component<{
    srcLeft: string,
    srcRight: string,
    srcTop: string,
    startHidden:boolean,
    onSwipeLeft: () => void,
    onSwipeRight: () => void,
    onSwipeTop: () => void,
    onSwipeDown: () => void,
    onController: (controller: {
        show: () => void,
        triggerTop: () => void,
        triggerDown: () => void,
        triggerLeft: () => void,
        triggerRight: () => void,
        gestureStart: (ev: any) => void,
        gestureMove: (ev: any) => void,
        tap: (ev: any) => void,
        gestureEnd: (ev: any) => void,
    }) => void
}, {}> {

    private stackedCardsobj: any;
    private rotate = true; //Activate the this.elements' rotation for each move on stacked cards.
    private useOverlays = false; //Enable or disable the overlays for swipe this.elements.
    private topobj: any; //Keep the swipe top properties.
    private rightobj: any; //Keep the swipe right properties.
    private leftobj: any; //Keep the swipe left properties.
    private currentElementObj: any; //Keep the stacked card this.element to swipe.
    private isFirstTime = true;
    private elementHeight: number;
    private obj: any;
    private elTrans: any;

    //Touch events block
    private startX: number;
    private startY: number;
    private translateX: number;
    private translateY: number;
    private currentX: number;
    private currentY: number;
    private touchingelement = false;
    private topOpacity: number;
    private rightOpacity: number;
    private leftOpacity: number;

    private firstActivation = false;

    backToMiddle() {
        this.removeNoTransition();
        this.transformUi(0, 0, 1, this.currentElementObj);

        if (this.useOverlays) {
            this.transformUi(0, 0, 0, this.leftobj);
            this.transformUi(0, 0, 0, this.rightobj);
            this.transformUi(0, 0, 0, this.topobj);
        }
    };

    //Change states
    changeStages() {
        //Event listener created to know when transition ends and changes states
        let fct = () => {
            if (document) {
                if (document.querySelector('.stage')) {
                    // @ts-ignore
                    document.querySelector('.stage').classList.add('hidden');
                    // @ts-ignore
                    document.querySelector('.final-state').classList.remove('hidden');
                    // @ts-ignore
                    document.querySelector('.final-state').classList.add('active');
                }
            }
            this.currentElementObj.removeEventListener('transitionend', fct);
        };
        if (this.currentElementObj) {
            this.currentElementObj.addEventListener('transitionend', fct);
        }
    };

    //Functions to swipe left this.elements on logic external action.
    onActionLeft() {
        if (this.useOverlays) {
            this.leftobj.classList.remove('no-transition');
            this.topobj.classList.remove('no-transition');
            this.leftobj.style.zIndex = '8';
            this.transformUi(0, 0, 1, this.leftobj);

        }

        setTimeout(() => {
            this.beforeSwipe("left");
            this.props.onSwipeLeft();
            this.resetOverlayLeft();
        }, 300);
    };

    //Functions to swipe right this.elements on logic external action.
    onActionRight() {
        if (this.useOverlays) {
            this.rightobj.classList.remove('no-transition');
            this.topobj.classList.remove('no-transition');
            this.rightobj.style.zIndex = '8';
            this.transformUi(0, 0, 1, this.rightobj);
        }

        setTimeout(() => {
            this.beforeSwipe("right");
            this.props.onSwipeRight();
            this.resetOverlayRight();
        }, 300);
    };

    //Functions to swipe top this.elements on logic external action.
    onActionTop() {
        if (this.useOverlays) {
            this.leftobj.classList.remove('no-transition');
            this.rightobj.classList.remove('no-transition');
            this.topobj.classList.remove('no-transition');
            this.topobj.style.zIndex = '8';
            this.transformUi(0, 0, 1, this.topobj);
        }

        setTimeout(() => {
            this.beforeSwipe("top");
            this.props.onSwipeTop();
            this.resetOverlays();
        }, 300); //wait animations end
    };

    //Functions to swipe top this.elements on logic external action.
    onActionDown() {
        if (this.useOverlays) {
            this.leftobj.classList.remove('no-transition');
            this.rightobj.classList.remove('no-transition');
            this.topobj.classList.remove('no-transition');
            this.topobj.style.zIndex = '8';
            this.transformUi(0, 0, 1, this.topobj);
        }

        setTimeout(() => {
            this.beforeSwipe("down");
            this.props.onSwipeDown();
            this.resetOverlays();
        }, 300); //wait animations end
    };


    //Swipe active card to left.
    beforeSwipe(type: string) {
        this.removeNoTransition();
        if (type === "top") {
            this.transformUi(0, -1000, 0, this.currentElementObj);
        }
        if (type === "down") {
            this.transformUi(0, 1000, 0, this.currentElementObj);
        }
        if (type === "left") {
            this.transformUi(-1000, 0, 0, this.currentElementObj);
        }
        if (type === "right") {
            this.transformUi(1000, 0, 0, this.currentElementObj);
        }
        this.updateUi();
        this.changeStages();
    };


    //Remove transitions from all this.elements to be moved in each swipe movement to improve perfomance of stacked cards.
    removeNoTransition() {
        if (this.useOverlays) {
            this.leftobj.classList.remove('no-transition');
            this.rightobj.classList.remove('no-transition');
            this.topobj.classList.remove('no-transition');
        }

        this.currentElementObj.classList.remove('no-transition');
        this.currentElementObj.style.zIndex = 6;
    };

    //Move the overlay left to initial position.
    resetOverlayLeft() {
        if (this.useOverlays) {
            setTimeout(() => {
                if (!this.isFirstTime) {

                    this.leftobj.classList.add('no-transition');
                    this.topobj.classList.add('no-transition');

                }
                window.requestAnimationFrame(() => {

                    this.leftobj.style.transform = "this.translateX(0) this.translateY(" + this.elTrans + "px) translateZ(0)";
                    this.leftobj.style.webkitTransform = "this.translateX(0) this.translateY(" + this.elTrans + "px) translateZ(0)";
                    this.leftobj.style.opacity = '0';

                    this.topobj.style.transform = "this.translateX(0) this.translateY(" + this.elTrans + "px) translateZ(0)";
                    this.topobj.style.webkitTransform = "this.translateX(0) this.translateY(" + this.elTrans + "px) translateZ(0)";
                    this.topobj.style.opacity = '0';

                });

            }, 300);

            this.isFirstTime = false;
        }
    };

    //Move the overlay right to initial position.
    resetOverlayRight() {
        if (this.useOverlays) {
            setTimeout(() => {
                this.elTrans = 0;

                if (!this.isFirstTime) {

                    this.rightobj.classList.add('no-transition');
                    this.topobj.classList.add('no-transition');

                }

                window.requestAnimationFrame(() => {

                    this.rightobj.style.transform = "this.translateX(0) this.translateY(" + this.elTrans + "px) translateZ(0)";
                    this.rightobj.style.webkitTransform = "this.translateX(0) this.translateY(" + this.elTrans + "px) translateZ(0)";
                    this.rightobj.style.opacity = '0';

                    this.topobj.style.transform = "this.translateX(0) this.translateY(" + this.elTrans + "px) translateZ(0)";
                    this.topobj.style.webkitTransform = "this.translateX(0) this.translateY(" + this.elTrans + "px) translateZ(0)";
                    this.topobj.style.opacity = '0';

                });

            }, 300);

            this.isFirstTime = false;
        }
    };

    //Move the overlays to initial position.
    resetOverlays() {
        if (this.useOverlays) {

            setTimeout(() => {
                this.elTrans = 0;

                if (!this.isFirstTime) {

                    this.leftobj.classList.add('no-transition');
                    this.rightobj.classList.add('no-transition');
                    this.topobj.classList.add('no-transition');

                }

                window.requestAnimationFrame(() => {

                    this.leftobj.style.transform = "this.translateX(0) this.translateY(" + this.elTrans + "px) translateZ(0)";
                    this.leftobj.style.webkitTransform = "this.translateX(0) this.translateY(" + this.elTrans + "px) translateZ(0)";
                    this.leftobj.style.opacity = '0';

                    this.rightobj.style.transform = "this.translateX(0) this.translateY(" + this.elTrans + "px) translateZ(0)";
                    this.rightobj.style.webkitTransform = "this.translateX(0) this.translateY(" + this.elTrans + "px) translateZ(0)";
                    this.rightobj.style.opacity = '0';

                    this.topobj.style.transform = "this.translateX(0) this.translateY(" + this.elTrans + "px) translateZ(0)";
                    this.topobj.style.webkitTransform = "this.translateX(0) this.translateY(" + this.elTrans + "px) translateZ(0)";
                    this.topobj.style.opacity = '0';

                });

            }, 300);	// wait for animations time

            this.isFirstTime = false;
        }
    };

    // Function to generate rotate value
    rotateRegulator(value) {
        if (value / 10 > 15) {
            return 15;
        } else if (value / 10 < -15) {
            return -15;
        }
        return value / 10;
    }

    //Add translate X and Y to active card for each frame.
    //Add translate X and Y to active card for each frame.
    transformUi(moveX, moveY, opacity, elementObj) {
        window.requestAnimationFrame(() => {
            let element = elementObj;

            let rotateElement = 0;
            if (this.rotate) {
                rotateElement = this.rotateRegulator(moveX);
            } else {
                rotateElement = 0;
            }

            if (element) {
                element.style.webkitTransform = "translateX(" + moveX + "px) translateY(" + (moveY) + "px) translateZ(0) rotate(" + rotateElement + "deg)";
                element.style.transform = "translateX(" + moveX + "px) translateY(" + (moveY) + "px) translateZ(0) rotate(" + rotateElement + "deg)";
                element.style.opacity = opacity;
            }
        });
    };


    //Action to update all this.elements on the DOM for each stacked card.
    updateUi() {
        if (this.currentElementObj != this.stackedCardsobj.children[0] || !this.currentElementObj) {
            //console.log("regular update");
            let listElNodesobj = this.stackedCardsobj.children;
            this.currentElementObj = listElNodesobj[0];
            window.requestAnimationFrame(() => {
                if (this.currentElementObj) {
                    this.currentElementObj.classList.add('stackedcards-none', 'stackedcards--animatable');
                    this.currentElementObj.style.transform = 'scale(1) this.translateX(0) this.translateY(0 px) translateZ(0)';
                    this.currentElementObj.style.webkitTransform = 'scale(1) this.translateX(0) this.translateY(0 px) translateZ(0)';
                    this.currentElementObj.style.opacity = this.props.startHidden?0:1;
                    this.currentElementObj.style.zIndex = 5;
                }

            });
        }
    };

    initStack() {
        //Prepare this.elements on DOM
        this.currentElementObj.classList.add('stackedcards-none', 'stackedcards--animatable');

        this.elTrans = 0;
        this.currentElementObj.style.zIndex = 0;
        this.currentElementObj.style.opacity = 0;
        this.currentElementObj.style.webkitTransform = 'scale(' + (1 - (0.04)) + ') this.translateX(0) this.translateY(' + this.elTrans + 'px) translateZ(0)';
        this.currentElementObj.style.transform = 'scale(' + (1 - (0.04)) + ') this.translateX(0) this.translateY(' + this.elTrans + 'px) translateZ(0)';

        if (this.useOverlays) {
            this.leftobj.style.transform = 'this.translateX(0px) this.translateY(' + this.elTrans + 'px) translateZ(0px) rotate(0deg)';
            this.leftobj.style.webkitTransform = 'this.translateX(0px) this.translateY(' + this.elTrans + 'px) translateZ(0px) rotate(0deg)';

            this.rightobj.style.transform = 'this.translateX(0px) this.translateY(' + this.elTrans + 'px) translateZ(0px) rotate(0deg)';
            this.rightobj.style.webkitTransform = 'this.translateX(0px) this.translateY(' + this.elTrans + 'px) translateZ(0px) rotate(0deg)';

            this.topobj.style.transform = 'this.translateX(0px) this.translateY(' + this.elTrans + 'px) translateZ(0px) rotate(0deg)';
            this.topobj.style.webkitTransform = 'this.translateX(0px) this.translateY(' + this.elTrans + 'px) translateZ(0px) rotate(0deg)';

        } else {
            this.leftobj.className = '';
            this.rightobj.className = '';
            this.topobj.className = '';

            this.leftobj.classList.add('stackedcards-overlay-hidden');
            this.rightobj.classList.add('stackedcards-overlay-hidden');
            this.topobj.classList.add('stackedcards-overlay-hidden');
        }

        //Remove class init
        setTimeout(() => {
            this.obj.classList.remove('init');
        }, 150);

    }

    setOverlayOpacity() {

        this.topOpacity = (((this.translateY + (this.elementHeight) / 2) / 100) * -1);
        this.rightOpacity = this.translateX / 100;
        this.leftOpacity = ((this.translateX / 100) * -1);


        if (this.topOpacity > 1) {
            this.topOpacity = 1;
        }

        if (this.rightOpacity > 1) {
            this.rightOpacity = 1;
        }

        if (this.leftOpacity > 1) {
            this.leftOpacity = 1;
        }
    }

    getXYfromEvent(evt: any) {
        this.currentX = evt.pointers ? evt.pointers[0].screenX : evt.changedTouches ? evt.changedTouches[0].screenX : evt.screenX;
        this.currentY = evt.pointers ? evt.pointers[0].screenY : evt.changedTouches ? evt.changedTouches[0].screenY : evt.screenY;
        return {x: this.currentX, y: this.currentY};
    }

    gestureStart(evt: any) {
        if (!this.firstActivation) {
            return;
        }
        this.touchingelement = true;
        evt.preventDefault();
        //console.log("gestureStart");

        let xYfromEvent = this.getXYfromEvent(evt);
        this.startX = xYfromEvent.x;
        this.startY = xYfromEvent.y;

        this.currentX = this.startX;
        this.currentY = this.startY;

        this.setOverlayOpacity();

        if (this.currentElementObj) {
            this.currentElementObj.classList.add('no-transition');

            if (this.useOverlays) {
                this.leftobj.classList.add('no-transition');
                this.rightobj.classList.add('no-transition');
                this.topobj.classList.add('no-transition');
            }

            this.elementHeight = this.currentElementObj.offsetHeight / 3;
        }


    };

    gestureMove(evt: any) {
        if (!this.firstActivation) {
            return;
        }
        if (!this.touchingelement) {
            return;
        }
        let xYfromEvent = this.getXYfromEvent(evt);
        this.currentX = xYfromEvent.x;
        this.currentY = xYfromEvent.y;

        this.translateX = this.currentX - this.startX;
        this.translateY = this.currentY - this.startY;

        this.setOverlayOpacity();

        evt.preventDefault();
        this.transformUi(this.translateX, this.translateY, 1, this.currentElementObj);

        if (this.useOverlays) {
            this.transformUi(this.translateX, this.translateY, this.topOpacity, this.topobj);

            if (this.translateX < 0) {
                this.transformUi(this.translateX, this.translateY, this.leftOpacity, this.leftobj);
                this.transformUi(0, 0, 0, this.rightobj);

            } else if (this.translateX > 0) {
                this.transformUi(this.translateX, this.translateY, this.rightOpacity, this.rightobj);
                this.transformUi(0, 0, 0, this.leftobj);
            }

        }


    };

    gestureEnd(evt: any) {
        if (!this.firstActivation) {
            return;
        }
        if (!this.touchingelement) {
            return;
        }
        this.touchingelement = false;

        //console.log("gestureEnd");

        this.translateX = this.currentX - this.startX;
        this.translateY = this.currentY - this.startY;

        let action = false;
        if (evt.distance) {
            let distance = evt.distance;
            let DIRECTION_LEFT = 2;
            let DIRECTION_RIGHT = 4;
            let DIRECTION_UP = 8;
            let DIRECTION_DOWN = 16;
            //console.log(evt.direction);
            //http://hammerjs.github.io/api/#hammer-recognizer
            if (distance > 60 && evt.direction) {
                if (evt.direction == DIRECTION_UP) {
                    this.beforeSwipe("top");
                    this.props.onSwipeTop();
                    action = true;
                }
                if (evt.direction == DIRECTION_DOWN) {
                    this.beforeSwipe("down");
                    this.props.onSwipeDown();
                    action = true;
                }
                if (evt.direction == DIRECTION_LEFT) {
                    this.beforeSwipe("left");
                    this.props.onSwipeLeft();
                    action = true;
                }
                if (evt.direction == DIRECTION_RIGHT) {
                    this.beforeSwipe("right");
                    this.props.onSwipeRight();
                    action = true;
                }
            }
        }

        if (!action) {
            this.backToMiddle();
            this.resetOverlays();
        }
    };

    stackedCards(domElement: any) {
        if (this.obj == domElement) {
            return;
        }
        this.obj = domElement;
        this.firstActivation = false;
        this.internalUpdate();

    }

    show(){

        this.transformUi(0, 0, 1, this.currentElementObj);
        /*window.requestAnimationFrame(() => {
            if (this.currentElementObj) {
                this.currentElementObj.classList.add('no-transition');
                this.currentElementObj.style.opacity = 1;
            }
            this.setOverlayOpacity();
        });*/
    }

    componentDidMount() {
    }

    internalUpdate() {
        if (!this.firstActivation) {
            //console.log("first activation");
            this.firstActivation = true;
            this.stackedCardsobj = this.obj.querySelector('.stackedcards-container');

            this.topobj = this.obj.querySelector('.stackedcards-overlay.top');
            this.rightobj = this.obj.querySelector('.stackedcards-overlay.right');
            this.leftobj = this.obj.querySelector('.stackedcards-overlay.left');

            this.updateUi();
            this.initStack();

            this.props.onController({
                show: () => {
                    this.show();
                },
                triggerLeft: () => {
                    this.onActionLeft();
                },
                triggerRight: () => {
                    this.onActionRight();
                },
                triggerTop: () => {
                    this.onActionTop();
                },
                triggerDown: () => {
                    this.onActionDown();
                },
                gestureEnd: (ev: any) => {
                    this.gestureEnd(ev);
                },
                gestureStart: (ev: any) => {
                    this.gestureStart(ev);
                },
                gestureMove: (ev: any) => {
                    this.gestureMove(ev);
                },
                tap: (ev: any) => {
                    //console.log("tap");
                },
            })
        } else {
            this.updateUi();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.internalUpdate();
    }

    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (
            <div id={"stacked-cards-block"} ref={el => {
                if (el) {
                    this.stackedCards(el)
                }
            }}
                 className="stackedcards stackedcards--animatable init"
                 style={{height: "100%"}}>
                <div className="stackedcards-container" style={{height: "100%"}}>
                    {this.props.children}
                </div>
                <div style={{zIndex: 7, pointerEvents: "none"}}
                     className="stackedcards--animatable stackedcards-overlay top"><img
                    draggable={false} alt="alt" src={this.props.srcTop} width="auto" height="auto"/>
                </div>
                <div style={{zIndex: 8, pointerEvents: "none"}}
                     className="stackedcards--animatable stackedcards-overlay right"><img
                    draggable={false} alt="alt" src={this.props.srcRight} width="auto" height="auto"/></div>
                <div style={{zIndex: 8, pointerEvents: "none"}}
                     className="stackedcards--animatable stackedcards-overlay left"><img
                    draggable={false} alt="alt" src={this.props.srcLeft} width="auto" height="auto"/>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(SwipeCards);