import * as React from 'react'
import {Component} from 'react'
import withStyles from "@material-ui/core/styles/withStyles";
import {DotsVertical, Flag} from 'mdi-material-ui';//https://materialdesignicons.com/
import IconButton from "@material-ui/core/IconButton";
import Popover from "@material-ui/core/Popover";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {report} from "../../service/log/Report";

const styles = theme => ({});

class ContentMenuButton extends Component<{
    contentId: string,
    userId: string,
    type:string,
    onClick:()=>void,
}, {}> {
    state = {
        anchorEl: null,
    };

    handleClick = event => {
        this.setState({
            anchorEl: event.currentTarget,
        });
    };

    handleClose = () => {
        this.setState({
            anchorEl: null,
        });
    };

    reportContent() {
        report.reportContent(this.props.type,this.props.contentId);
        this.props.onClick();
        this.handleClose();
    }

    reportUser() {
        report.reportUser(this.props.userId);
        this.props.onClick();
        this.handleClose();
    }

    render() {
        const {anchorEl} = this.state;
        const open = Boolean(anchorEl);
        return <React.Fragment>
            <IconButton
                onClick={this.handleClick}
                style={{float: "right", fontSize: "20px", padding: "0"}}>
                <DotsVertical/>
            </IconButton>
            <Popover
                id="simple-popper"
                open={open}
                anchorEl={anchorEl}
                onClose={this.handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >

                <div style={{
                    overflow: "hidden",
                    padding: "5px",
                    margin: "5px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start"
                }}>
                    <List component="nav">
                        <ListItem button onClick={() => this.reportContent()}>
                            <Flag/>
                            <ListItemText primary="Report content"/>
                        </ListItem>
                        <ListItem button onClick={() => this.reportUser()}>
                            <Flag/>
                            <ListItemText primary="Report user"/>
                        </ListItem>
                    </List>
                </div>
            </Popover>
        </React.Fragment>
    }

}

export default withStyles(styles)(ContentMenuButton);