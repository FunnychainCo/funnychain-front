import * as React from 'react';
import {Component} from 'react';
import {deviceDetector} from "../../service/mobile/DeviceDetector";

/**
 *
 */
export default class ExternalLink extends Component<any, {}> {

    state = {
        mobile: true
    };

    componentDidMount() {
        this.setState({mobile: deviceDetector.isMobile()});
    }

    render() {
        return (
            <React.Fragment>
                {!this.state.mobile &&
                <a href={this.props.href} {...this.props}>
                    {this.props.children}
                </a>
                }
                {this.state.mobile &&
                <span
                    onClick={() => {
                    window.open(this.props.href, "_system");
                }
                } {...this.props}>
                        {this.props.children}
                </span>
                }
            </React.Fragment>
        )
    }
}
