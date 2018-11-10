import {Component} from 'react'
import * as React from 'react'
import {backService} from "../service/BackService";

export default class BackListener extends Component<{
    match: any,
    history: any
}, {}> {
    private removeBackListener: () => void = () => {
    };

    componentDidMount() {

        this.removeBackListener = this.props.history.listen(location => {
            if (this.props.history.action === "POP") {
                backService.notifyBack();
            }
        });
        backService.setRequestBackCalback(() => {
            this.props.history.goBack();
        })
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
