import {Component} from 'react';
import * as React from 'react';
import {leftMenuService} from "../../service/LeftMenuService";
import {authService} from "../../service/generic/AuthService";
import UserPasswordRegisterDialog from "../LoginDialog/UserPasswordRegisterDialog";
import Logged from "./Logged";
import NotLogged from "./NotLogged";
import AccountDrawer from "../Account/AccountDrawer";
import AppBar from "@material-ui/core/AppBar/AppBar";
import Typography from "@material-ui/core/Typography/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import Toolbar from "@material-ui/core/Toolbar/Toolbar";
import Tabs from "@material-ui/core/Tabs/Tabs";
import Tab from "@material-ui/core/Tab/Tab";
import {USER_ENTRY_NO_VALUE} from "../../service/generic/UserEntry";
import LoginRegisterDialog from "../LoginDialog/LoginRegisterDialog";
import { Link } from 'react-router-dom';

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
    logged: boolean,
    dialogLogin: boolean,
    dialogRegister: boolean,
    drawerOpen: boolean,
    currentSelected: number//trending
}> {
    state = {
        logged: false,
        dialogLogin: false,
        dialogRegister: false,
        drawerOpen: false,
        currentSelected: 2//trending
    };
    private removeListener: () => void;
    itemOrder = {"hot": 0, "trending": 1, "fresh": 2};

    componentDidMount() {
        this.setState({currentSelected:this.itemOrder[this.props.type]});
        this.removeListener = authService.onAuthStateChanged((user) => {
            this.setState({
                logged: user !== USER_ENTRY_NO_VALUE ? true : false
            });
        });
    }

    componentWillUnmount() {
        this.removeListener();
    }

    onLeftIconButtonClick() {
        leftMenuService.requestOpening();
    }

    openDialogLogin = () => {
        this.setState({dialogLogin: true});
    };

    openDialogRegister = () => {
        this.setState({dialogRegister: true});
    };

    handleFeedButton(feed: number) {
        this.setState({currentSelected: feed});
    }

    render() {
        const {classes} = this.props;
        const HotTabLinkLink = (props) => <Link to={"/hot"} {...props} />
        const TrendingTabLink = (props) => <Link to={"/trending"} {...props} />
        const FreshTabLink = (props) => <Link to={"/fresh"} {...props} />
        return (
            <AppBar position="static">
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
                            <Tab label="Trending" style={{minWidth: '30px'}}  component={TrendingTabLink}/>
                            <Tab label="Fresh" style={{minWidth: '30px'}}  component={FreshTabLink}/>
                        </Tabs>
                    </Typography>
                    <div>
                        {this.state.logged ?
                            <Logged onAccountClick={() => {
                                this.setState({drawerOpen: true})
                            }}/> :
                            <NotLogged
                                onDialogLogin={this.openDialogLogin}
                                onDialogRegister={this.openDialogRegister}
                            />}
                    </div>
                </Toolbar>
                <LoginRegisterDialog open={this.state.dialogLogin}
                                     onRequestClose={() => this.setState({dialogLogin: false})}/>
                <UserPasswordRegisterDialog open={this.state.dialogRegister}
                                            onRequestClose={() => this.setState({dialogRegister: false})}/>
                <AccountDrawer open={this.state.drawerOpen}
                               onRequestChange={(open) => {
                                   this.setState({drawerOpen: open})
                               }}/>
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