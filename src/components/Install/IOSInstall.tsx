import * as React from 'react'
import {Component} from 'react'
import {withStyles} from '@material-ui/core/styles';
import MobileStepper from "@material-ui/core/MobileStepper";
import Button from "@material-ui/core/Button";
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
//https://materialdesignicons.com/

const AutoPlaySwipeableViews = SwipeableViews;

const styles: any = theme => ({});

class IOSInstall extends Component<{
    classes: any
}, { activeStep: number }> {

    state = {
        activeStep: 0,
    };

    handleNext = () => {
        this.setState(prevState => ({
            activeStep: prevState.activeStep + 1,
        }));
    };

    handleBack = () => {
        this.setState(prevState => ({
            activeStep: prevState.activeStep - 1,
        }));
    };

    handleStepChange = activeStep => {
        this.setState({activeStep});
    };

    componentWillMount() {
    }

    componentWillUnmount() {
    }

    render() {
        const {classes} = this.props;
        const {activeStep} = this.state;
        const maxSteps = 3;
        return (
            <div style={{flexGrow: 1, display: "flex", justifyContent: "center", flexDirection: "column"}}>
                <AutoPlaySwipeableViews
                    style={{flexGrow: 1, display: "flex", justifyContent: "center", flexDirection: "column"}}
                    index={activeStep}
                    onChangeIndex={this.handleStepChange}
                    enableMouseEvents
                >
                    <div key={"1"} style={{
                        flexGrow: 1,
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        margin: "10%"
                    }}>
                        <div style={{textAlign: "center", fontSize: "1.1em"}}>
                            <img style={{flexGrow: 1, maxWidth: "100%", maxHeight: "100%"}}
                                 src="/static/image/install/ios-1.png" alt="install"/>
                            <br/>
                            <b style={{fontSize: "1.3em"}}>Tap the "share" button at the bottom of your browser's
                                toolbar</b><br/>
                        </div>
                    </div>
                    <div key={"2"} style={{
                        flexGrow: 1,
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        margin: "10%"
                    }}>
                        <div style={{textAlign: "center", fontSize: "1.1em"}}>
                            <img style={{flexGrow: 1, maxWidth: "100%", maxHeight: "100%"}}
                                 src="/static/image/install/ios-2.png" alt="install"/>
                            <br/>
                            <b style={{fontSize: "1.3em"}}>Tap the "Add to Home screen" icon in the "share"
                                menu</b><br/>
                        </div>
                    </div>
                    <div key={"3"} style={{
                        flexGrow: 1,
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        margin: "10%"
                    }}>
                        <div style={{textAlign: "center", fontSize: "1.1em"}}>
                            <img style={{flexGrow: 1, maxWidth: "100%", maxHeight: "100%"}}
                                 src="/static/image/install/ios-3.png" alt="install"/>
                            <br/>
                            <b style={{fontSize: "1.3em"}}>Tap the "add" button, and you're ready to go! The app is now
                                available on your home screen</b><br/>
                        </div>
                    </div>
                </AutoPlaySwipeableViews>
                <MobileStepper
                    steps={maxSteps}
                    position="static"
                    activeStep={activeStep}
                    className={classes.mobileStepper}
                    nextButton={
                        <Button size="small" onClick={this.handleNext} disabled={activeStep === maxSteps - 1}>
                            Next
                            <KeyboardArrowRight/>
                        </Button>
                    }
                    backButton={
                        <Button size="small" onClick={this.handleBack} disabled={activeStep === 0}>
                            <KeyboardArrowLeft/>
                            Back
                        </Button>
                    }
                />
            </div>
        )
    }
}

export default withStyles(styles)(IOSInstall);