import * as React from 'react'
import {Component} from 'react'
import {withStyles} from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import InstallButtons from "../StartPopUp/InstallButtons";

const styles: any = theme => ({});

class AppInstallPopupForDesktop extends Component<{
    classes: any
}, {}> {

    componentDidMount(): void {
    }

    componentWillUnmount() {
    }

    render() {
        return (<Typography style={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                margin: "10%"
            }}>
                <span style={{textAlign: "center", fontSize: "1.1em"}}>
                    <InstallButtons/>
                </span>
            </Typography>
        )
    }
}

export default withStyles(styles)(AppInstallPopupForDesktop);