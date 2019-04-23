import * as React from 'react';
import {Component} from 'react';
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";

import withStyles from "@material-ui/core/styles/withStyles";

const styles = (theme) => ({
    main: {
        display: "flex",
        justifyContent: "center ",
        alignItems: "center",
        height: "100px"
    }
});

export class LoadingBlock extends Component<{ classes: any }, {}> {
    render() {
        const {classes} = this.props;
        return (
            <React.Fragment>
                <div className={classes.main} style={{flexDirection: "column"}}>
                    <CircularProgress/>
                    <div>Loading data</div>
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(styles)(LoadingBlock);
