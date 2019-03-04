import * as React from 'react';
import {Component} from 'react';
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";

export default class LoadingBlock extends Component<any,{}> {
    render () {
        return (
            <div style={{flexDirection:"column",display:"flex",justifyContent:"center ",alignItems:"center",height:"100px"}}>
                <CircularProgress />
                <div>Loading data</div>
            </div>
        )
    }
}
