import * as React from 'react';
import {Component} from 'react';
import axios from 'axios'
import {audit} from "../../service/log/Audit";
import {GLOBAL_PROPERTIES} from "../../properties/properties";

export default class Version extends Component {

    version = GLOBAL_PROPERTIES.VERSION();

    componentDidMount(){
        console.log("funnychain version: "+this.version);
        this.getServerVersion();
    }

    getServerVersion(){
        axios.get(GLOBAL_PROPERTIES.FUNNYCHAIN_SERVICE_VERSION()).then(response => {
            console.log("funnychain backend version: "+response.data+" ("+GLOBAL_PROPERTIES.FUNNYCHAIN_HOST()+")");
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
            }}>  {this.version}</span>
        )
    }
}
