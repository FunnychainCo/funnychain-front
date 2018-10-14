import {Component} from 'react';
import * as React from 'react';
import axios from 'axios'
import {backEndPropetiesProvider} from "../../service/BackEndPropetiesProvider";

export default class Version extends Component {

    VERSION = "1.1.3";

    componentDidMount(){
        console.log("funnychain version: "+this.VERSION);
        this.getServerVersion();
    }

    getServerVersion(){
        axios.get(backEndPropetiesProvider.getProperty('FUNNYCHAIN_SERVICE')+"/service/version").then(response => {
            console.log("funnychain backend version: "+response.data);
        }).catch(error => {
            console.error(error);
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
            }}>{this.VERSION}</span>
        )
    }
}
