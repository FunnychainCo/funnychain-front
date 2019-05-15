import * as React from 'react';
import './SwipeCards.css';
import {withStyles} from '@material-ui/core/styles';

const styles: any = (theme: any) => ({});

class SwipeCards extends React.Component<{
    srcLeft: string,
    srcRight: string,
    srcTop: string
    onSwipeLeft: () => void,
    onSwipeRight: () => void,
    onSwipeTop: () => void,
    onController: (controller: {
        triggerTop: () => void,
        triggerLeft: () => void,
        triggerRight: () => void,
    }) => void
}, {}> {
    private listElNodesobj: any[];
    private stackedCardsobj: any;
    stackedOptions = 'None'; //Change stacked cards view from 'Bottom', 'Top' or 'None'.
    rotate = true; //Activate the this.elements' rotation for each move on stacked cards.
    items = 1; //Number of visible this.elements when the stacked options are bottom or top.
    elementsMargin = 0; //Define the distance of each this.element when the stacked options are bottom or top.
    useOverlays = true; //Enable or disable the overlays for swipe this.elements.
    maxelements: number = 1; //Total of stacked cards on DOM.
    currentPosition = 0; //Keep the position of active stacked card.
    velocity = 0.3; //Minimum this.velocity allowed to trigger a swipe.
    topobj: any; //Keep the swipe top properties.
    rightobj: any; //Keep the swipe right properties.
    leftobj: any; //Keep the swipe left properties.
    listElNodesWidth: number; //Keep the stacked cards width.
    currentelementobj: any; //Keep the stacked card this.element to swipe.
    isFirstTime = true;
    elementHeight: number;
    obj: any;
    elTrans: any;

    //Touch events block
    element:any;
    startTime: number;
    startX: number;
    startY: number;
    translateX: number;
    translateY: number;
    currentX: number;
    currentY: number;
    touchingelement = false;
    timeTaken;
    topOpacity: number;
    rightOpacity: number;
    leftOpacity: number;

    backToMiddle() {

        this.removeNoTransition();
        this.transformUi(0, 0, 1, this.currentelementobj);

        if (this.useOverlays) {
            this.transformUi(0, 0, 0, this.leftobj);
            this.transformUi(0, 0, 0, this.rightobj);
            this.transformUi(0, 0, 0, this.topobj);
        }

        this.setZindex(5);

        if (!(this.currentPosition >= this.maxelements)) {
            //roll back the opacity of second this.element
            if ((this.currentPosition + 1) < this.maxelements) {
                this.listElNodesobj[this.currentPosition + 1].style.opacity = '.8';
            }
        }
    };

    // Usable functions
    countelements() {
        this.maxelements = this.listElNodesobj.length;
        if (this.items > this.maxelements) {
            this.items = this.maxelements;
        }
    };

    //Keep the active card.
    currentelement() {
        this.currentelementobj = this.listElNodesobj[this.currentPosition];
    };

    //Change states
    changeStages() {
        if (this.currentPosition === this.maxelements) {
            //Event listener created to know when transition ends and changes states
            this.listElNodesobj[this.maxelements - 1].addEventListener('transitionend', () => {
                document.body.classList.add("background-7");
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
                this.listElNodesobj[this.maxelements - 1].removeEventListener('transitionend', null, false);
            });
        }
    };

    //Functions to swipe left this.elements on logic external action.
    onActionLeft() {
        if (!(this.currentPosition >= this.maxelements)) {
            if (this.useOverlays) {
                this.leftobj.classList.remove('no-transition');
                this.topobj.classList.remove('no-transition');
                this.leftobj.style.zIndex = '8';
                this.transformUi(0, 0, 1, this.leftobj);

            }

            setTimeout(() => {
                this.onSwipeLeft();
                this.resetOverlayLeft();
            }, 300);
        }
    };

    //Functions to swipe right this.elements on logic external action.
    onActionRight() {
        if (!(this.currentPosition >= this.maxelements)) {
            if (this.useOverlays) {
                this.rightobj.classList.remove('no-transition');
                this.topobj.classList.remove('no-transition');
                this.rightobj.style.zIndex = '8';
                this.transformUi(0, 0, 1, this.rightobj);
            }

            setTimeout(() => {
                this.onSwipeRight();
                this.resetOverlayRight();
            }, 300);
        }
    };

    //Functions to swipe top this.elements on logic external action.
    onActionTop() {
        if (!(this.currentPosition >= this.maxelements)) {
            if (this.useOverlays) {
                this.leftobj.classList.remove('no-transition');
                this.rightobj.classList.remove('no-transition');
                this.topobj.classList.remove('no-transition');
                this.topobj.style.zIndex = '8';
                this.transformUi(0, 0, 1, this.topobj);
            }

            setTimeout(() => {
                this.onSwipeTop();
                this.resetOverlays();
            }, 300); //wait animations end
        }
    };

    //Swipe active card to left.
    onSwipeLeft() {
        this.removeNoTransition();
        this.transformUi(-1000, 0, 0, this.currentelementobj);
        if (this.useOverlays) {
            this.transformUi(-1000, 0, 0, this.leftobj); //Move leftOverlay
            this.transformUi(-1000, 0, 0, this.topobj); //Move topOverlay
            this.resetOverlayLeft();
        }
        this.currentPosition = this.currentPosition + 1;
        this.updateUi();
        this.currentelement();
        this.changeStages();
        this.setActiveHidden();
        //debounce event
        this.props.onSwipeLeft();
    };

    //Swipe active card to right.
    onSwipeRight() {
        this.removeNoTransition();
        this.transformUi(1000, 0, 0, this.currentelementobj);
        if (this.useOverlays) {
            this.transformUi(1000, 0, 0, this.rightobj); //Move rightOverlay
            this.transformUi(1000, 0, 0, this.topobj); //Move topOverlay
            this.resetOverlayRight();
        }

        this.currentPosition = this.currentPosition + 1;
        this.updateUi();
        this.currentelement();
        this.changeStages();
        this.setActiveHidden();
        this.props.onSwipeRight();
    };

    //Swipe active card to top.
    onSwipeTop() {
        this.removeNoTransition();
        this.transformUi(0, -1000, 0, this.currentelementobj);
        if (this.useOverlays) {
            this.transformUi(0, -1000, 0, this.leftobj); //Move leftOverlay
            this.transformUi(0, -1000, 0, this.rightobj); //Move rightOverlay
            this.transformUi(0, -1000, 0, this.topobj); //Move topOverlay
            this.resetOverlays();
        }

        this.currentPosition = this.currentPosition + 1;
        this.updateUi();
        this.currentelement();
        this.changeStages();
        this.setActiveHidden();
        this.props.onSwipeTop();
    };

    //Remove transitions from all this.elements to be moved in each swipe movement to improve perfomance of stacked cards.
    removeNoTransition() {
        if (this.listElNodesobj[this.currentPosition]) {

            if (this.useOverlays) {
                this.leftobj.classList.remove('no-transition');
                this.rightobj.classList.remove('no-transition');
                this.topobj.classList.remove('no-transition');
            }

            this.listElNodesobj[this.currentPosition].classList.remove('no-transition');
            this.listElNodesobj[this.currentPosition].style.zIndex = 6;
        }

    };

    //Move the overlay left to initial position.
    resetOverlayLeft() {
        if (!(this.currentPosition >= this.maxelements)) {
            if (this.useOverlays) {
                setTimeout(() => {

                    if (this.stackedOptions === "Top") {

                        this.elTrans = this.elementsMargin * (this.items - 1);

                    } else if (this.stackedOptions === "Bottom" || this.stackedOptions === "None") {

                        this.elTrans = 0;

                    }

                    if (!this.isFirstTime) {

                        this.leftobj.classList.add('no-transition');
                        this.topobj.classList.add('no-transition');

                    }

                    requestAnimationFrame(() => {

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
        }
    };

    //Move the overlay right to initial position.
    resetOverlayRight() {
        if (!(this.currentPosition >= this.maxelements)) {
            if (this.useOverlays) {
                setTimeout(() => {

                    if (this.stackedOptions === "Top") {

                        this.elTrans = this.elementsMargin * (this.items - 1);

                    } else if (this.stackedOptions === "Bottom" || this.stackedOptions === "None") {

                        this.elTrans = 0;

                    }

                    if (!this.isFirstTime) {

                        this.rightobj.classList.add('no-transition');
                        this.topobj.classList.add('no-transition');

                    }

                    requestAnimationFrame(() => {

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
        }
    };

    //Move the overlays to initial position.
    resetOverlays() {
        if (!(this.currentPosition >= this.maxelements)) {
            if (this.useOverlays) {

                setTimeout(() => {
                    if (this.stackedOptions === "Top") {

                        this.elTrans = this.elementsMargin * (this.items - 1);

                    } else if (this.stackedOptions === "Bottom" || this.stackedOptions === "None") {

                        this.elTrans = 0;

                    }

                    if (!this.isFirstTime) {

                        this.leftobj.classList.add('no-transition');
                        this.rightobj.classList.add('no-transition');
                        this.topobj.classList.add('no-transition');

                    }

                    requestAnimationFrame(() => {

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
        }
    };

    setActiveHidden() {
        if (!(this.currentPosition >= this.maxelements)) {
            this.listElNodesobj[this.currentPosition - 1].classList.remove('stackedcards-active');
            this.listElNodesobj[this.currentPosition - 1].classList.add('stackedcards-hidden');
            this.listElNodesobj[this.currentPosition].classList.add('stackedcards-active');
        }
    };

    //Set the new z-index for specific card.
    setZindex(zIndex: number) {
        if (this.listElNodesobj[this.currentPosition]) {
            this.listElNodesobj[this.currentPosition].style.zIndex = zIndex;
        }
    };

    // Remove this.element from the DOM after swipe. To use this method you need to call this function in onSwipeLeft, onSwipeRight and onSwipeTop and put the method just above the letiable 'this.currentPosition = this.currentPosition + 1'.
    //On the actions onSwipeLeft, onSwipeRight and onSwipeTop you need to remove the this.currentPosition letiable (this.currentPosition = this.currentPosition + 1) and the function setActiveHidden

    /*function removethis.element() {
        this.currentelementobj.remove();
        if(!(this.currentPosition >= this.maxelements)){
            this.listElNodesobj[this.currentPosition].classList.add('stackedcards-active');
        }
    };*/

    //Add translate X and Y to active card for each frame.
    //Add translate X and Y to active card for each frame.
    transformUi(moveX, moveY, opacity, elementObj) {
        requestAnimationFrame(() => {
            var element = elementObj;

            // Function to generate rotate value
            function RotateRegulator(value) {
                if (value / 10 > 15) {
                    return 15;
                } else if (value / 10 < -15) {
                    return -15;
                }
                return value / 10;
            }

            let rotateElement = 0;
            if (this.rotate) {
                rotateElement = RotateRegulator(moveX);
            } else {
                rotateElement = 0;
            }

            if (this.stackedOptions === "Top") {
                this.elTrans = this.elementsMargin * (this.items - 1);
                if (element) {
                    element.style.webkitTransform = "translateX(" + moveX + "px) translateY(" + (moveY + this.elTrans) + "px) translateZ(0) rotate(" + rotateElement + "deg)";
                    element.style.transform = "translateX(" + moveX + "px) translateY(" + (moveY + this.elTrans) + "px) translateZ(0) rotate(" + rotateElement + "deg)";
                    element.style.opacity = opacity;
                }
            } else if (this.stackedOptions === "Bottom" || this.stackedOptions === "None") {

                if (element) {
                    element.style.webkitTransform = "translateX(" + moveX + "px) translateY(" + (moveY) + "px) translateZ(0) rotate(" + rotateElement + "deg)";
                    element.style.transform = "translateX(" + moveX + "px) translateY(" + (moveY) + "px) translateZ(0) rotate(" + rotateElement + "deg)";
                    element.style.opacity = opacity;
                }

            }
        });
    };


//Action to update all this.elements on the DOM for each stacked card.
    updateUi() {
        requestAnimationFrame(() => {
            this.elTrans = 0;
            let elZindex = 5;
            let elScale = 1;
            let elOpac = 1;
            let elTransTop = this.items;
            let elTransInc = this.elementsMargin;

            for (let i = this.currentPosition; i < (this.currentPosition + this.items); i++) {
                if (this.listElNodesobj[i]) {
                    if (this.stackedOptions === "Top") {

                        this.listElNodesobj[i].classList.add('stackedcards-top', 'stackedcards--animatable', 'stackedcards-origin-top');

                        if (this.useOverlays) {
                            this.leftobj.classList.add('stackedcards-origin-top');
                            this.rightobj.classList.add('stackedcards-origin-top');
                            this.topobj.classList.add('stackedcards-origin-top');
                        }

                        this.elTrans = elTransInc * elTransTop;
                        elTransTop--;

                    } else if (this.stackedOptions === "Bottom") {
                        this.listElNodesobj[i].classList.add('stackedcards-bottom', 'stackedcards--animatable', 'stackedcards-origin-bottom');

                        if (this.useOverlays) {
                            this.leftobj.classList.add('stackedcards-origin-bottom');
                            this.rightobj.classList.add('stackedcards-origin-bottom');
                            this.topobj.classList.add('stackedcards-origin-bottom');
                        }

                        this.elTrans = this.elTrans + elTransInc;

                    } else if (this.stackedOptions === "None") {

                        this.listElNodesobj[i].classList.add('stackedcards-none', 'stackedcards--animatable');
                        this.elTrans = this.elTrans + elTransInc;

                    }

                    this.listElNodesobj[i].style.transform = 'scale(' + elScale + ') this.translateX(0) this.translateY(' + (this.elTrans - elTransInc) + 'px) translateZ(0)';
                    this.listElNodesobj[i].style.webkitTransform = 'scale(' + elScale + ') this.translateX(0) this.translateY(' + (this.elTrans - elTransInc) + 'px) translateZ(0)';
                    this.listElNodesobj[i].style.opacity = elOpac;
                    this.listElNodesobj[i].style.zIndex = elZindex;

                    elScale = elScale - 0.04;
                    elOpac = elOpac - (1 / this.items);
                    elZindex--;
                }
            }

        });

    };

    initStack() {
        //Prepare this.elements on DOM
        let addMargin = this.elementsMargin * (this.items - 1) + 'px';

        if (this.stackedOptions === "Top") {

            for (let i = this.items; i < this.maxelements; i++) {
                this.listElNodesobj[i].classList.add('stackedcards-top', 'stackedcards--animatable', 'stackedcards-origin-top');
            }

            this.elTrans = this.elementsMargin * (this.items - 1);

            this.stackedCardsobj.style.marginBottom = addMargin;

        } else if (this.stackedOptions === "Bottom") {


            for (let i = this.items; i < this.maxelements; i++) {
                this.listElNodesobj[i].classList.add('stackedcards-bottom', 'stackedcards--animatable', 'stackedcards-origin-bottom');
            }

            this.elTrans = 0;

            this.stackedCardsobj.style.marginBottom = addMargin;

        } else if (this.stackedOptions === "None") {

            for (let i = this.items; i < this.maxelements; i++) {
                this.listElNodesobj[i].classList.add('stackedcards-none', 'stackedcards--animatable');
            }

            this.elTrans = 0;

        }

        for (let i = this.items; i < this.maxelements; i++) {
            this.listElNodesobj[i].style.zIndex = 0;
            this.listElNodesobj[i].style.opacity = 0;
            this.listElNodesobj[i].style.webkitTransform = 'scale(' + (1 - (this.items * 0.04)) + ') this.translateX(0) this.translateY(' + this.elTrans + 'px) translateZ(0)';
            this.listElNodesobj[i].style.transform = 'scale(' + (1 - (this.items * 0.04)) + ') this.translateX(0) this.translateY(' + this.elTrans + 'px) translateZ(0)';
        }

        if (this.listElNodesobj[this.currentPosition]) {
            this.listElNodesobj[this.currentPosition].classList.add('stackedcards-active');
        }

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

    gestureStart(evt: any) {
        this.touchingelement = true;
        evt.preventDefault();
        console.log("gestureStart");
        this.startTime = new Date().getTime();

        let xYfromEvent = this.getXYfromEvent(evt);
        this.startX = xYfromEvent.x;
        this.startY = xYfromEvent.y;

        this.currentX = this.startX;
        this.currentY = this.startY;

        this.setOverlayOpacity();

        if (!(this.currentPosition >= this.maxelements)) {
            if (this.listElNodesobj[this.currentPosition]) {
                this.listElNodesobj[this.currentPosition].classList.add('no-transition');
                this.setZindex(6);

                if (this.useOverlays) {
                    this.leftobj.classList.add('no-transition');
                    this.rightobj.classList.add('no-transition');
                    this.topobj.classList.add('no-transition');
                }

                if ((this.currentPosition + 1) < this.maxelements) {
                    this.listElNodesobj[this.currentPosition + 1].style.opacity = '1';
                }

                this.elementHeight = this.listElNodesobj[this.currentPosition].offsetHeight / 3;
            }

        }

    };

    getXYfromEvent(evt: any) {
        this.currentX = evt.pointers ? evt.pointers[0].screenX : evt.changedTouches ? evt.changedTouches[0].screenX : evt.screenX;
        this.currentY = evt.pointers ? evt.pointers[0].screenY : evt.changedTouches ? evt.changedTouches[0].screenY : evt.screenY;
        return {x: this.currentX, y: this.currentY};
    }

    gestureMove(evt: any) {
        if (!this.touchingelement) {
            return;
        }
        let xYfromEvent = this.getXYfromEvent(evt);
        this.currentX = xYfromEvent.x;
        this.currentY = xYfromEvent.y;

        this.translateX = this.currentX - this.startX;
        this.translateY = this.currentY - this.startY;

        this.setOverlayOpacity();

        if (!(this.currentPosition >= this.maxelements)) {
            evt.preventDefault();
            this.transformUi(this.translateX, this.translateY, 1, this.currentelementobj);

            if (this.useOverlays) {
                this.transformUi(this.translateX, this.translateY, this.topOpacity, this.topobj);

                if (this.translateX < 0) {
                    this.transformUi(this.translateX, this.translateY, this.leftOpacity, this.leftobj);
                    this.transformUi(0, 0, 0, this.rightobj);

                } else if (this.translateX > 0) {
                    this.transformUi(this.translateX, this.translateY, this.rightOpacity, this.rightobj);
                    this.transformUi(0, 0, 0, this.leftobj);
                }

                if (this.useOverlays) {
                    this.leftobj.style.zIndex = 8;
                    this.rightobj.style.zIndex = 8;
                    this.topobj.style.zIndex = 7;
                }

            }

        }

    };

    gestureEnd(evt: any) {
        if (!this.touchingelement) {
            return;
        }
        this.touchingelement = false;

        console.log("gestureEnd");

        this.translateX = this.currentX - this.startX;
        this.translateY = this.currentY - this.startY;

        this.timeTaken = new Date().getTime() - this.startTime;


        if (!(this.currentPosition >= this.maxelements)) {
            if (this.translateY < (this.elementHeight * -1) && this.translateX > ((this.listElNodesWidth / 2) * -1) && this.translateX < (this.listElNodesWidth / 2)) {  //is Top?
                if (this.translateY < (this.elementHeight * -1) || (Math.abs(this.translateY) / this.timeTaken > this.velocity)) { // Did It Move To Top?
                    this.onSwipeTop();
                }
            } else {
                if (this.translateX < 0) {
                    if (this.translateX < ((this.listElNodesWidth / 2) * -1) || (Math.abs(this.translateX) / this.timeTaken > this.velocity)) { // Did It Move To Left?
                        this.onSwipeLeft();
                    }
                } else if (this.translateX > 0) {
                    if (this.translateX > (this.listElNodesWidth / 2) && (Math.abs(this.translateX) / this.timeTaken > this.velocity)) { // Did It Move To Right?
                        this.onSwipeRight();
                    }
                }
            }
        }
        this.backToMiddle();
        this.resetOverlays();
    };

    initHammer(){
        const Hammer = require('hammerjs');
        let hammertime = new Hammer(this.element, {domEvents: true});
        hammertime.add(new Hammer.Swipe()).recognizeWith(hammertime.get('pan'));
        hammertime.add(new Hammer.Tap());
        /*hammertime.on("panstart tap panend", function (ev) {
            console.log(ev.type + " gesture detected. " + ev.isFinal);
        });*/
        hammertime.on("panstart", (ev) => {
            if (!ev.isFinal) {
                ev.srcEvent.stopPropagation();
                this.gestureStart(ev);
            }
        });
        hammertime.on("panmove", (ev) => {
            ev.srcEvent.stopPropagation();
            this.gestureMove(ev);
        });
        hammertime.on("tap", (ev) => {
            //"/meme/" + encodeURIComponent(this.state.meme.id)
            console.log("tap");
        });
        hammertime.on("panend", (ev) => {
            ev.srcEvent.stopPropagation();
            this.gestureEnd(ev);
        });

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

    updateUI1(){
        this.listElNodesobj = this.stackedCardsobj.children;
        this.items = this.stackedCardsobj.children.length;
        this.countelements();
        this.currentelement();
        this.listElNodesWidth = this.stackedCardsobj.offsetWidth;
        this.currentelementobj = this.listElNodesobj[0];
    }

    stackedCards() {
        console.log("new swipe");

        this.obj = document.getElementById('stacked-cards-block');
        this.stackedCardsobj = this.obj.querySelector('.stackedcards-container');

        this.topobj = this.obj.querySelector('.stackedcards-overlay.top');
        this.rightobj = this.obj.querySelector('.stackedcards-overlay.right');
        this.leftobj = this.obj.querySelector('.stackedcards-overlay.left');

        this.updateUI1();
        this.updateUi();
        this.initStack();
        this.element = this.obj;
        this.initHammer();

        this.props.onController({
            triggerLeft: () => {
                this.onActionLeft();
            },
            triggerRight: () => {
                this.onActionRight();
            },
            triggerTop: () => {
                this.onActionTop();
            }
        })

    }


    componentDidMount() {
        this.stackedCards();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.updateUI1();
        this.updateUi();
    }

    render() {
        return (
            <div id="stacked-cards-block" className="stackedcards stackedcards--animatable init"
                 style={{height: "100%"}}>
                <div className="stackedcards-container" style={{height: "100%"}}>
                    {this.props.children}
                </div>
                <div className="stackedcards--animatable stackedcards-overlay top"><img
                    draggable={false} alt="alt" src={this.props.srcTop} width="auto" height="auto"/>
                </div>
                <div className="stackedcards--animatable stackedcards-overlay right"><img
                    draggable={false} alt="alt" src={this.props.srcRight} width="auto" height="auto"/></div>
                <div className="stackedcards--animatable stackedcards-overlay left"><img
                    draggable={false} alt="alt" src={this.props.srcLeft} width="auto" height="auto"/>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(SwipeCards);