import * as React from 'react';
import {Component} from 'react';

import withStyles from "@material-ui/core/styles/withStyles";
import {CircularProgress} from "@material-ui/core";

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
            <div>
                <div className={classes.main} style={{flexDirection: "column"}}>
                    <CircularProgress />
                    <div>Loading data</div>
                </div>
            </div>
        )
    }
}

export default withStyles(styles)(LoadingBlock);
