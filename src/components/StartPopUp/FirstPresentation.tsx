import * as React from 'react'
import {Component} from 'react'
import {withStyles} from '@material-ui/core/styles';
import MobileStepper from "@material-ui/core/MobileStepper";
import Button from "@material-ui/core/Button";
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import InstallButtons from './InstallButtons';
import Typography from "@material-ui/core/Typography";
import {deviceDetector} from "../../service/mobile/DeviceDetector";
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
        const maxSteps = 2;
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
                            <b style={{fontSize: "1.0em"}}>
                                Significant hurdles prevent cryptocurrency mass adoption (volatility, scalability, time
                                and education). We believe that with Funnychain, by having fun looking at memes, people
                                will be using a decentralized application (with no central authority) and earn
                                cryptocurrencies using it.<br/>
                                A meme dApp where people gets rewarded in crypto without having to buy it first is the
                                best way to bring crypto mass adoption.<br/>
                                Funnychain allows users to view and share the funniest-rated memes with their friends,
                                workplace, and the community. The platform incentivizes users for creating, curating,
                                sharing memes, and especially rewards community founders/admins. Users can also bet on
                                their favorite memes in cryptocurrencies, chat with friends using their favorite memes
                                and share with their own community.<br/>
                                <br/>
                                Break the barriers for crypto mass adoption.<br/>
                                Funny and make money.<br/>
                                - <b>Funnychain</b><br/>
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

export default withStyles(styles)(FirstPresentation);