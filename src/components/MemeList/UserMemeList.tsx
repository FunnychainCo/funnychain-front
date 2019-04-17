import * as React from 'react';
import {Component} from 'react';
import ModalPage from "../ModalPage/ModalPage";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import Button from "@material-ui/core/Button/Button";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import {MemeLinkInterface, MemeLoaderInterface} from "../../service/generic/ApplicationInterface";
import {Waypoint} from "react-waypoint";
import LoadingBlock from "../LoadingBlock/LoadingBlock";
import {memeService} from "../../service/generic/MemeService";
import MemeComponent from '../Meme/MemeComponent';

interface State {
    memes: { [id: string]: MemeLinkInterface },
    memesOrder: string[];
    displayWaypoint: boolean,
    loading : boolean,
}

export default class UserMemeList extends Component<{
    userid: string,
    onRequestClose: () => void,
    open: boolean,
}, State> {

    handleClose = () => {
        this.props.onRequestClose();
    };

    state: State = {
        memes: {},
        memesOrder: [],
        displayWaypoint: true,
        loading: true,
    };

    private removeCallbackOnMemeData: (() => void) = () => {
    };
    private removeCallbackOnMemeOrder: (() => void) = () => {
    };
    private removeCallbackOnInitialLoadingFinished: () => void = () => {
    };

    private memeLoader: MemeLoaderInterface;


    componentWillMount() {
        this.restartMemeLoader(this.props.userid);
    }

    restartMemeLoader(uid: string) {
        this.memeLoader = memeService.getMemeLoaderByUser(uid);
        this.setState({memesOrder: []});//reset meme order
        this.removeCallbackOnMemeData();
        this.removeCallbackOnMemeData = this.memeLoader.onMemeData((meme: MemeLinkInterface) => {
            let tmpState = {};
            tmpState[meme.id] = meme;
            this.setState((state) => ({memes: {...tmpState, ...state.memes}}));//reset view
            console.log(meme);
        });
        this.removeCallbackOnMemeOrder();
        this.removeCallbackOnMemeOrder = this.memeLoader.onMemeOrder((memesKey: string[]) => {
            let tmp = this.state.memesOrder.concat(memesKey);
            this.setState({memesOrder: tmp});//update view
        });
        this.removeCallbackOnInitialLoadingFinished();
        this.removeCallbackOnInitialLoadingFinished = this.memeLoader.onInitialLoadingFinished(() => {
            this.setState({loading: false});//update view
        });
        this.memeLoader.loadMore(5);
    }

    componentWillUnmount() {
        this.removeCallbackOnMemeData();
        this.removeCallbackOnMemeOrder();
        this.removeCallbackOnInitialLoadingFinished();
    }

    renderWaypoint = (key) => {
        //console.log("create waypoint "+key + " => "+this.state.memes[key].title);
        if (this.state.displayWaypoint) {
            return (
                /*<div style={{minHeight: "100px", width: "100%", backgroundColor: "red"}}>*/
                <Waypoint
                    key={"waypoint" + key}
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
            <ModalPage
                open={this.props.open}
                onClose={this.handleClose}
            >
                <DialogContent>
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
                    {this.state.loading && <LoadingBlock/>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </ModalPage>
        )
    }
}
