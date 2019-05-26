import * as React from 'react';
import {Component} from 'react';
import AppBar from "@material-ui/core/AppBar/AppBar";
import Typography from "@material-ui/core/Typography/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import Toolbar from "@material-ui/core/Toolbar/Toolbar";
import BackButton from "./BackButton";
import HeaderRightIcon from "./HeaderRightIcon";
import {deviceDetector} from "../../service/mobile/DeviceDetector";
import Button from "@material-ui/core/Button/Button";
import {createMuiTheme} from "@material-ui/core";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    flex: {
        flex: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
    feedButton: {
        color: "white"
    },
    headerSpacing: {
        paddingRight: "20px"
    },
    tabsStyle: {
        backgroundColor: theme.palette.background.paper
    }
});

class Header extends Component<{
    type: string,
    onTypeChange: (type: string) => void,
    classes: any
}, {
    currentSelected: any,
    betPoolBalance: number,
    compact: boolean,
    extendedHeaderHeight:boolean
}> {
    state = {
        currentSelected: 0,
        betPoolBalance: 0,
        compact: true,
        extendedHeaderHeight:false,
    };
    itemOrder = {
        "hot": 0,
        "fresh": 1
    };

    componentDidMount() {
        window.addEventListener('resize', this.throttledHandleWindowResize);
        this.throttledHandleWindowResize();
        if (this.props.type !== "hot" && this.props.type !== "fresh") {
            this.setState({currentSelected: false});
        } else {
            this.setState({currentSelected: this.itemOrder[this.props.type]});
        }
        /*firebaseBetService.getBetPool().then(balance => {
            this.setState({betPoolBalance: balance});
        });*/
        if(deviceDetector.isIphoneX()){
            console.log("iphoneX");
            this.setState({extendedHeaderHeight:true});
        }
    }


    componentWillUnmount() {
        window.removeEventListener('resize', this.throttledHandleWindowResize);
    }

    throttledHandleWindowResize = () => {
        this.setState({compact: window.innerWidth < 480});
    };

    handleFeedButton(feed: number) {
        this.props.onTypeChange(feed == 0 ? "hot" : "fresh");
        this.setState({currentSelected: feed});
    }

    render() {
        let theme = createMuiTheme({

            typography: {
                useNextVariants: true,
            },
            palette: {
                type: 'dark',
                //https://material.io/tools/color/#!/?view.left=0&view.right=0&primary.color=212121&secondary.color=FF3D00
                primary: {
                    light: '#000000',
                    main: '#000000',
                    dark: '#000000',
                },
                secondary: {
                    light: '#7843ff',
                    main: '#1e00ff',
                    dark: '#0000ca',
                },
            },
        });
        const {classes} = this.props;
        //const HotTabLinkLink = (props) => <Link to={"/hot"} {...props} />;
        //const FreshTabLink = (props) => <Link to={"/fresh"} {...props} />;
        return (
            // overflow: "hidden" to ensure scroll-x is not activated on small device (looks ugly)
            <AppBar style={{overflow: "hidden",paddingTop:this.state.extendedHeaderHeight?"25px":"0"}} position="sticky">
                <Toolbar>
                    <BackButton>
                        <img style={{maxHeight: "40px", paddingRight: "7px"}} src="/android-chrome-192x192.png" alt="logo"/>
                    </BackButton>

                    <MuiThemeProvider theme={theme}>
                    <Typography variant="h6" className={classes.flex}>
                        <Button color={"primary"} onClick={(event) => {
                            this.handleFeedButton(0);
                        }} variant={this.state.currentSelected==0?"contained":"outlined"}
                                style={{margin:this.state.compact?"2px":"5px",padding: '5px'}}
                        >Top</Button>
                        <Button color={"primary"} onClick={(event) => {
                            this.handleFeedButton(1);
                        }} variant={this.state.currentSelected==1?"contained":"outlined"}
                                style={{margin:this.state.compact?"2px":"5px",padding: '5px'}}>New</Button>
                    </Typography>
                    </MuiThemeProvider>

                    <HeaderRightIcon />
                </Toolbar>
            </AppBar>
        )
    }
}

export default withStyles(styles)(Header);