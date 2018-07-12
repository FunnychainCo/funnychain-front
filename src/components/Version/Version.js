import React, {Component} from 'react'
export default class Version extends Component {

    render () {
        const style = {
            margin: 0,
            top: 'auto',
            right: 'auto',
            bottom: 2,
            fontSize: '0.5em',
            left: 2,
            position: 'fixed',
        };
        return (
            <span style={style}>0.2.13</span>
        )
    }
}
