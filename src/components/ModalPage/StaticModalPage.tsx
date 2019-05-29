import * as React from 'react';
import {Component} from 'react';
import {deviceDetector} from "../../service/mobile/DeviceDetector";
import Dialog from "@material-ui/core/Dialog/Dialog";
import withStyles from "@material-ui/core/styles/withStyles";

class StaticModalPage extends Component<{
    title: string,
    open: boolean,
    onRequestClose: () => void,
    children: any,
    classes,
}, {}> {
    static defaultProps = {
        title: "",
        open: true,
        onRequestClose: () => {
        },
        children: <React.Fragment></React.Fragment>
    };

    state = {
        jsready: false,
    };

    private mobileRender: boolean;

    componentWillMount(): void {
        this.mobileRender = deviceDetector.isMobileRender();
    }

    componentDidMount(){
        //called on client only after SSR
        this.setState({jsready: true});
    }

    render() {
        const classes = this.props.classes;
        return (
            <Dialog
                className={"staticDialog"}
                classes={classes}
                fullScreen={this.mobileRender}
                disablePortal={!this.state.jsready}
                title={this.props.title}
                open={this.props.open}
                onClose={this.props.onRequestClose}
            >
                {this.props.children}
            </Dialog>
        )
    }
}

const style:any = {
}

export default withStyles(style)(StaticModalPage)