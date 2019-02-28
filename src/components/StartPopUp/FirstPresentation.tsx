import * as React from 'react'
import {Component} from 'react'
import {withStyles} from '@material-ui/core/styles';
import MobileStepper from "@material-ui/core/MobileStepper";
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import InstallButtons from './InstallButtons';
import Typography from "@material-ui/core/Typography";
import {deviceDetector} from "../../service/mobile/DeviceDetector";
import Fab from "@material-ui/core/Fab";
//https://materialdesignicons.com/

const AutoPlaySwipeableViews = SwipeableViews;

const styles: any = theme => ({
    root: {
        backgroundColor: "white",
    },
});

class FirstPresentation extends Component<{
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
                        <div style={{textAlign: "center", fontSize: "1.0em"}}>
                            <img style={{flexGrow: 1,maxWidth:"100%",maxHeight:"100%"}} src="https://ipfs.funnychain.co/ipfs/QmeZsE4XDAe6SdXwHrmj2XXx4Ce7xD7d3pxkwbQGFRLmFA" alt="install" />
                            <h2>
                                Welcome to Funnychain!
                            </h2>
                            <b style={{fontSize: "1.0em"}}>
                                Like, post or invest
                                on the best memes to
                                get paid!
                            </b><br/>
                        </div>
                    </div>
                    <div key={"2"} style={{
                        flexGrow: 1,
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        margin: "10%"
                    }}>
                        <div style={{textAlign: "center", fontSize: "1.0em"}}>
                            <img style={{flexGrow: 1,maxWidth:"100%",maxHeight:"100%"}} src="https://ipfs.funnychain.co/ipfs/QmTkiEYEmy4kWraMD8tKChrvbhZe4HJa2vixjRLPWXw9gR" alt="install" />
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
                            {!deviceDetector.isMobile() &&
                            <InstallButtons/>
                            }
                            {deviceDetector.isMobile() &&
                            <Typography>
                                That's all enjoy the app!
                            </Typography>
                            }
                        </div>
                    </div>
                </AutoPlaySwipeableViews>
                <MobileStepper
                    steps={maxSteps}
                    position="static"
                    activeStep={activeStep}
                    className={classes.root}
                    nextButton={
                        <Fab variant="extended" color={"primary"} size="medium" onClick={this.handleNext} disabled={activeStep === maxSteps - 1}>
                            Next
                            <KeyboardArrowRight/>
                        </Fab>
                    }
                    backButton={
                        <Fab variant="extended" color={"primary"} size="medium" onClick={this.handleBack} disabled={activeStep === 0}>
                            <KeyboardArrowLeft/>
                            Back
                        </Fab>
                    }
                />
            </div>
        )
    }
}

export default withStyles(styles)(FirstPresentation);