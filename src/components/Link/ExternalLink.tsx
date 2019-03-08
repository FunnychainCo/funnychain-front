import * as React from 'react';
import {Component} from 'react';
import {deviceDetector} from "../../service/mobile/DeviceDetector";

/**
 *
 */
export default class ExternalLink extends Component<any, {}> {

    state = {};

    componentDidMount() {    }

    render() {
        return (
            <React.Fragment>
                {!deviceDetector.isAndroid() &&
                <a href={this.props.href}
                   target="_system"
                   {...this.props}
                >
                    {this.props.children}
                </a>
                }
                {deviceDetector.isAndroid() &&
                <span
                    onClick={() => {
                        window.open(this.props.href, "_system");
                    }}
                    {...this.props}>
                        {this.props.children}
                </span>
                }
            </React.Fragment>
        )
    }
}
