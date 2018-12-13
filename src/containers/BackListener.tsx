import * as React from 'react'
import {Component} from 'react'
import {backService} from "../service/BackService";

export default class BackListener extends Component<{
    match: any,
    location:any,
    history: any
}, {}> {

    length: number=0;

    private removeBackListener: () => void = () => {
    };

    componentDidMount() {
        this.removeBackListener = this.props.history.listen(location => {
            if (this.props.history.action === "POP") {
                this.length--;
                backService.notifyBackAvailable(this.isBackAvailable());
                backService.notifyBack();
            }else if (this.props.history.action === "PUSH") {
                this.length++;
                backService.notifyBackAvailable(this.isBackAvailable());
            }
        });
        backService.setRequestBackCalback(() => {
            this.props.history.goBack();
        })
    }

    isBackAvailable(): boolean {
        if (this.length === 0) {
            return false;
        } else {
            return true;
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
