import * as React from 'react'
import {Redirect} from 'react-router-dom'

export default class RedirectPage extends React.Component<any, any> {
    render() {
        return (<Redirect to='/hot'/>
        )
    }
}