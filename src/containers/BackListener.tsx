import * as React from 'react'
import {Component} from 'react'
import {backService} from "../service/BackService";

export default class BackListener extends Component<{
    match: any,
    location: any,
    history: any
}, {}> {

    length: number = 0;
    backInProgress = false;

    private removeBackListener: () => void = () => {
    };

    componentDidMount() {
        if (this.props.location.pathname !== "/") {
            //in this case that means the user has open an app page that is not the root so we replace the current by
            // the root and push the new page so the back button is coherent.
            this.props.history.replace("/");//replace by root
            this.props.history.push(this.props.location.pathname);//replace by root
            this.length++;
            backService.notifyBackAvailable(this.isBackAvailable());
        }
        this.removeBackListener = this.props.history.listen(location => {
            console.log("listener " + this.props.history.action);
            if (this.props.history.action === "POP") {
                this.length--;
                this.backInProgress = false;
                backService.notifyBackAvailable(this.isBackAvailable());
                backService.notifyBack();
            } else if (this.props.history.action === "PUSH") {
                this.length++;
                this.backInProgress = false;
                if (this.length > 0) {
                    backService.notifyBackAvailable(this.isBackAvailable());
                }
            }
        });
        backService.setRequestBackCalback(() => {
            if (this.length > 0 && !this.backInProgress) {
                this.backInProgress = true;
                console.log("go back " + this.length);
                this.props.history.goBack();
            }
        })
    }

    isBackAvailable(): boolean {
        if (this.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    componentWillUnmount() {
        this.removeBackListener();
    }

    goBack() {
    }

    render() {
        return (<div></div>)
    }
}
