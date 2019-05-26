import * as React from 'react';
import {Component} from 'react';

export default class FullPageWithHeader extends Component<{}, {}> {
    render() {
        //const {fullScreen}: any = this.props;
        return (
            <div style={{position: "absolute", width: "100%", height: "100%", backgroundColor: "#fafafa", zIndex: 100}}>
                <div style={{height: "64px"}} />
                {/*header space occupation*/}
                    {this.props.children}
            </div>
        )
    }
}