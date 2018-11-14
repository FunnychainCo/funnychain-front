import {Component} from 'react'
import * as React from 'react'
import {withStyles} from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import {Cancel} from 'mdi-material-ui';//https://materialdesignicons.com/

const styles: any = theme => ({});

class BrowserNotCompatible extends Component<{
    classes: any
}, {}> {

    componentWillMount() {
    }

    componentWillUnmount() {
    }

    render() {
        return (<Typography style={{flexGrow: 1, display: "flex", justifyContent: "center", flexDirection: "column",margin:"10%"}}>
                <div style={{textAlign: "center", fontSize: "1.1em"}}>
                    <Cancel style={{fontSize: 92}}/><br/>
                    <b style={{fontSize: "1.3em"}}>Your browser is not compatible</b><br/>
                    Our application is not compatible with your browser.<br/>
                    Please use Safari on IOS or Google Chrome on Android
                </div>
            </Typography>
        )
    }
}

export default withStyles(styles)(BrowserNotCompatible);