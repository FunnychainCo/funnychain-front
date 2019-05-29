import * as React from 'react';
import {Component} from 'react';
import ModalPageSSR from "./ModalPageSSR";

class ModalPage extends Component<{
    title: string,
    open: boolean,
    onRequestClose: () => void,
    children:any,
}, {}> {
    static defaultProps = {
        title: "",
        open: true,
        onRequestClose: () => {
        },
        children:<React.Fragment></React.Fragment>
    };

    render() {
        return (
            <ModalPageSSR title={this.props.title} open={this.props.open} onRequestClose={this.props.onRequestClose}>{this.props.children}</ModalPageSSR>
        )
    }
}


export default ModalPage;