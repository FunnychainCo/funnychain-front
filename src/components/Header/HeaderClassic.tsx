import * as React from 'react';
import {Component} from 'react';
import AppBar from "@material-ui/core/AppBar/AppBar";
import Typography from "@material-ui/core/Typography/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import Toolbar from "@material-ui/core/Toolbar/Toolbar";
import {firebaseBetService} from "../../service/firebase/FirebaseBetService";
import BackButton from "./BackButton";
import HeaderRightIcon from "./HeaderRightIcon";

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

class HeaderClassic extends Component<{ classes: any }, {
    currentSelected: any,
    betPoolBalance: number,
    compact: boolean,
}> {
    state = {
        currentSelected: false,
        betPoolBalance: 0,
        compact: true,
    };

    componentDidMount() {
        window.addEventListener('resize', this.throttledHandleWindowResize);
        this.throttledHandleWindowResize();
        firebaseBetService.getBetPool().then(balance => {
            this.setState({betPoolBalance: balance});
        });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.throttledHandleWindowResize);
    }

    throttledHandleWindowResize = () => {
        this.setState({compact: window.innerWidth < 480});
    };

    render() {
        const {classes} = this.props;
        return (
            // overflow: "hidden" to ensure scroll-x is not activated on small device (looks ugly)
            <AppBar style={{overflow: "hidden"}} position="sticky">
                <Toolbar>
                    <BackButton>
                        <img style={{maxHeight: "40px", paddingRight: "7px"}} src="/android-chrome-192x192.png"
                             alt="logo"/>
                    </BackButton>
                    <Typography variant="h6" color="inherit" className={classes.flex}></Typography>
                    <HeaderRightIcon/>
                </Toolbar>
            </AppBar>
        )
    }
}

export default withStyles(styles)(HeaderClassic);