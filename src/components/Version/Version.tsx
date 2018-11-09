import {Component} from 'react';
import * as React from 'react';
import axios from 'axios'
import {backEndPropetiesProvider} from "../../service/BackEndPropetiesProvider";
import {audit} from "../../service/Audit";

export default class Version extends Component {

    version = backEndPropetiesProvider.getProperty("VERSION");

    componentDidMount(){
        console.log("funnychain version: "+this.version);
        this.getServerVersion();
    }

    getServerVersion(){
        axios.get(backEndPropetiesProvider.getProperty('FUNNYCHAIN_SERVICE')+"/service/version").then(response => {
            console.log("funnychain backend version: "+response.data+" ("+backEndPropetiesProvider.getProperty('FUNNYCHAIN_SERVICE')+")");
        }).catch(error => {
            audit.reportError(error);
        });
    }

    render () {
        return (
            <span style={{
                margin: 0,
                top: 'auto',
                right: 'auto',
                bottom: 2,
                fontSize: '0.5em',
                left: 2,
                position: 'fixed',
            }}>{this.version}</span>
        )
    }
}
