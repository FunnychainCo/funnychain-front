import * as React from 'react';
import {Component} from 'react';
import AppBar from "@material-ui/core/AppBar/AppBar";
import Typography from "@material-ui/core/Typography/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import Toolbar from "@material-ui/core/Toolbar/Toolbar";
import Tabs from "@material-ui/core/Tabs/Tabs";
import Tab from "@material-ui/core/Tab/Tab";
import LoginAccountIcon from "../LoginAccountIcon/LoginAccountIcon";
import Chip from "@material-ui/core/Chip";
import Avatar from "@material-ui/core/Avatar";
import {firebaseBetService} from "../../service/firebase/FirebaseBetService";
import ArrowBackIos from "@material-ui/icons/ArrowBackIos";
import {backService} from "../../service/BackService";
import Button from "@material-ui/core/Button";
import LolTokenIcon from "../Icon/LolTokenIcon";
import WalletIcon from "../Icon/WalletIcon";
import IconButton from "@material-ui/core/IconButton";
//import {Link} from 'react-router-dom';

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
    backAvailableA: boolean
}> {
    state = {
        currentSelected: false,
        betPoolBalance: 0,
        compact: true,
        backAvailableA: backService.isBackAvailable()
    };
    itemOrder = {
        "hot": 0,
        "fresh": 1
    };
    private onBackAvailableRemoveListener: () => void = () => {
    };

    componentDidMount() {
        window.addEventListener('resize', this.throttledHandleWindowResize);
        this.throttledHandleWindowResize();
        if (this.props.type !== "hot" && this.props.type !== "fresh") {
            this.setState({currentSelected: false});
        } else {
            this.setState({currentSelected: this.itemOrder[this.props.type]});
        }
        firebaseBetService.getBetPool().then(balance => {
            this.setState({betPoolBalance: balance});
        });
        this.onBackAvailableRemoveListener = backService.onBackAvailable((backAvailable) => {
            this.setState({backAvailableA: backAvailable});
        });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.throttledHandleWindowResize);
        this.onBackAvailableRemoveListener();
    }

    throttledHandleWindowResize = () => {
        this.setState({compact: window.innerWidth < 480});
    };

    handleFeedButton(feed: number) {
        this.props.onTypeChange(feed == 0 ? "hot" : "fresh");
        this.setState({currentSelected: feed});
    }

    handleGoBack() {
        backService.goBack();
    }

    render() {
        const {classes} = this.props;
        //const HotTabLinkLink = (props) => <Link to={"/hot"} {...props} />;
        //const FreshTabLink = (props) => <Link to={"/fresh"} {...props} />;
        return (
            // overflow: "hidden" to ensure scroll-x is not activated on small device (looks ugly)
            <AppBar style={{overflow: "hidden"}} position="sticky">
                <Toolbar>
                    {(!this.state.backAvailableA) &&
                    <img style={{maxHeight: "40px", paddingRight: "7px"}} src="/android-chrome-192x192.png" alt="logo"/>
                    }
                    {this.state.backAvailableA &&
                    <Button size="small" color="inherit" aria-label="Back" onClick={() => {
                        this.handleGoBack()
                    }}><ArrowBackIos/>{this.state.compact ? "" : " back"}</Button>
                    }
                    <Typography variant="h6" color="inherit" className={classes.flex}>
                        <Tabs
                            value={this.state.currentSelected}
                            onChange={(event, value) => {
                                this.handleFeedButton(value);
                            }}
                            indicatorColor="primary"
                        >
                            {/*<Tab label="Hot" style={{minWidth: '30px'}} component={HotTabLinkLink}/>
                            <Tab label="Fresh" style={{minWidth: '30px'}} component={FreshTabLink}/>*/}
                            <Tab label="Hot" style={{minWidth: '30px'}}/>
                            <Tab label="Fresh" style={{minWidth: '30px'}}/>
                        </Tabs>
                    </Typography>

                    {false && <Chip label={(this.state.compact ? "" : "Pool: ") + this.state.betPoolBalance.toFixed(2)}
                                    color="secondary" avatar={<Avatar><LolTokenIcon/></Avatar>}/>}
                    <IconButton>
                        <WalletIcon/>
                    </IconButton>
                    &nbsp;&nbsp;
                    <LoginAccountIcon/>
                </Toolbar>
            </AppBar>
        )
    }
}

export default withStyles(styles)(Header);