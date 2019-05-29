import * as React from 'react';
import {Component} from 'react';
import ResponsiveModalPage from "./ResponsiveModalPage";
import StaticModalPage from "./StaticModalPage";

class ModalPageSSR extends Component<{
    title: string,
    open: boolean,
    onRequestClose: () => void
    children: any,
}, {}> {

    state = {
        jsready: false,
    };

    componentWillMount(): void {

    }

    componentDidMount(): void {
        //called on client only after SSR
        this.setState({jsready: false});//TODO deactivated for the moment due to an ugly blink (SSR)
    }

    render() {
        return (
            <React.Fragment>
                {this.state.jsready &&
                <React.Fragment>
                    <ResponsiveModalPage
                        title={this.props.title}
                        open={this.props.open}
                        onRequestClose={this.props.onRequestClose}>
                        {this.props.children}
                    </ResponsiveModalPage>
                </React.Fragment>
                }
                {!this.state.jsready &&
                <React.Fragment>
                    <StaticModalPage
                        title={this.props.title}
                        open={this.props.open}
                        onRequestClose={this.props.onRequestClose}>
                        {this.props.children}
                    </StaticModalPage>
                </React.Fragment>
                }
            </React.Fragment>
        )
    }
}


export default ModalPageSSR;