import {Component} from 'react';
import * as React from 'react';
import {leftMenuService} from "../../service/LeftMenuService";
import AppBar from "@material-ui/core/AppBar/AppBar";
import Typography from "@material-ui/core/Typography/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import Toolbar from "@material-ui/core/Toolbar/Toolbar";
import Tabs from "@material-ui/core/Tabs/Tabs";
import Tab from "@material-ui/core/Tab/Tab";
import { Link } from 'react-router-dom';
import LoginAccountIcon from "../LoginAccountIcon/LoginAccountIcon";
import Chip from "@material-ui/core/Chip";
import Avatar from "@material-ui/core/Avatar";
//import { Ethereum } from 'mdi-material-ui';
import {firebaseBetService} from "../../service/firebase/FirebaseBetService";
import DogeIcon from "../Icon/DogeIcon";

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
    type:string,
    classes:any
}, {
    currentSelected: any,
    betPoolBalance:number,
    compact:boolean
}> {
    state = {
        currentSelected: false,
        betPoolBalance:0,
        compact:true
    };
    itemOrder = {
        "hot": 0,
        //"trending": 1,
        "fresh": 1
    };

    componentDidMount() {
        window.addEventListener('resize', this.throttledHandleWindowResize);
        this.throttledHandleWindowResize();
        if(this.props.type!=="hot" && this.props.type!=="trending" && this.props.type!=="fresh"){
            this.setState({currentSelected:false});
        }else {
            this.setState({currentSelected:this.itemOrder[this.props.type]});
        }
        firebaseBetService.getBetPool().then(balance => {
            this.setState({betPoolBalance:balance});
        })
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.throttledHandleWindowResize);
    }

    throttledHandleWindowResize = () => {
        this.setState({ compact: window.innerWidth < 480 });
    };

    onLeftIconButtonClick() {
        leftMenuService.requestOpening();
    }

    handleFeedButton(feed: number) {
        this.setState({currentSelected: feed});
    }

    render() {
        const {classes} = this.props;
        const HotTabLinkLink = (props) => <Link to={"/hot"} {...props} />;
        //const TrendingTabLink = (props) => <Link to={"/trending"} {...props} />;
        const FreshTabLink = (props) => <Link to={"/fresh"} {...props} />;
        return (
            // overflow: "hidden" to ensure scroll-x is not activated on small device (looks ugly)
            <AppBar style={{overflow: "hidden"}} position="sticky">
                <Toolbar>
                    <img style={{maxHeight: "40px", paddingRight: "7px"}} src="/android-chrome-192x192.png" alt="logo"/>
                    <Typography variant="title" color="inherit" className={classes.flex}>
                        <Tabs
                            value={this.state.currentSelected}
                            onChange={(event, value) => {
                                this.handleFeedButton(value);
                            }}
                            indicatorColor="primary"
                        >
                            <Tab label="Hot" style={{minWidth: '30px'}} component={HotTabLinkLink}/>
                            {/*<Tab label="Trending" style={{minWidth: '30px'}}  component={TrendingTabLink}/>*/}
                            <Tab label="Fresh" style={{minWidth: '30px'}}  component={FreshTabLink}/>
                        </Tabs>
                    </Typography>

                    <Chip label={(this.state.compact?"":"Bet Pool: ")+this.state.betPoolBalance.toFixed(2)} color="secondary" avatar={<Avatar><DogeIcon /></Avatar>} />&nbsp;&nbsp;
                    <LoginAccountIcon />
                </Toolbar>
            </AppBar>
        )
    }
}

/**
 *
 <Button
 variant={this.state.currentSelected=="hot"?"raised":undefined}
 className={classes.feedButton}
 onClick={()=>{this.handleFeedButton("hot")}}>
 Hot
 </Button>
 <Button
 variant={this.state.currentSelected=="trending"?"raised":undefined}
 className={classes.feedButton}
 onClick={()=>{this.handleFeedButton("trending")}}>
 Trending
 </Button>
 <Button
 variant={this.state.currentSelected=="fresh"?"raised":undefined}
 className={classes.feedButton}
 onClick={()=>{this.handleFeedButton("fresh")}}>
 Fresh
 </Button>
 */
export default withStyles(styles)(Header);