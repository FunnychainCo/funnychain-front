import * as React from 'react';
import {Component} from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import ArrowBackIos from "@material-ui/icons/ArrowBackIos";
import {backService} from "../../service/BackService";
import Button from "@material-ui/core/Button";

const styles = theme => ({});

class BackButton extends Component<any, {
    backAvailableA: boolean,
    compact:boolean,
}> {
    state = {
        backAvailableA: backService.isBackAvailable(),
        compact:true,
    };

    private onBackAvailableRemoveListener: () => void = () => {
    };

    handleGoBack() {
        backService.goBack();
    }

    componentDidMount() {
        window.addEventListener('resize', this.throttledHandleWindowResize);
        this.onBackAvailableRemoveListener = backService.onBackAvailable((backAvailable) => {
            this.setState({backAvailableA: backAvailable});
        });
        this.setState({compact: window.innerWidth < 480});
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.throttledHandleWindowResize);
        this.onBackAvailableRemoveListener();
    }

    throttledHandleWindowResize = () => {
        this.setState({compact: window.innerWidth < 480});
    };

    render() {
        return (
            <React.Fragment>
                {(!this.state.backAvailableA) &&

                <React.Fragment>
                {this.props.children}
                </React.Fragment>
                }
                {this.state.backAvailableA &&
                <Button size="small" color="inherit" aria-label="Back" onClick={() => {
                    this.handleGoBack()
                }}><ArrowBackIos/>{this.state.compact ? "" : " back"}</Button>
                }
            </React.Fragment>
        )
    }
}

export default withStyles(styles)(BackButton);