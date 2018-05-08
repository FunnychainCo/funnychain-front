import React, {Component} from 'react'
import MemeList from "../components/MemeList/MemeList";

export default class Home extends Component {
    render() {
        return (
            <div className="fullSpace">
                <MemeList/>
            </div>
        )
    }
}