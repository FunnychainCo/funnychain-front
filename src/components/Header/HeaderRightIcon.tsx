import * as React from 'react';
import {Component} from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import LoginAccountIcon from "../LoginAccountIcon/LoginAccountIcon";
import Chip from "@material-ui/core/Chip";
import Avatar from "@material-ui/core/Avatar";
import LolTokenIcon from "../Icon/LolTokenIcon";

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

class HeaderRightIcon extends Component<{classes: any}, {
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
        /*firebaseBetService.getBetPool().then(balance => {
            this.setState({betPoolBalance: balance});
        });*/
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.throttledHandleWindowResize);
    }

    throttledHandleWindowResize = () => {
        this.setState({compact: window.innerWidth < 480});
    };

    render() {
        //const {classes} = this.props;
        return (<React.Fragment>
                    {false && <Chip label={(this.state.compact ? "" : "Pool: ") + this.state.betPoolBalance.toFixed(2)}
                                    color="secondary" avatar={<Avatar><LolTokenIcon/></Avatar>}/>}
                    <LoginAccountIcon/>
            </React.Fragment>
        )
    }
}

export default withStyles(styles)(HeaderRightIcon);