import React, {Component} from 'react'
import MemeListV2 from "../components/MemeList/MemeListV2";

export default class Home extends Component {
    render() {
        return (
            <div className="fullSpace">
                <MemeListV2/>
            </div>
        )
    }
}