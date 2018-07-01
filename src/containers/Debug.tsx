import {Component} from 'react'
import * as React from 'react'
import {debugService} from "../service/debugService";
import Switch from "@material-ui/core/Switch/Switch";

export default class Debug extends Component<{},{testNetwork:boolean}> {
    state={

    testNetwork: debugService.testNetwork
}
    render() {
        return (
            <div>
                <h1>debug</h1>

                <Switch
                    checked={this.state.testNetwork}
                    onChange={event => {
                        this.setState({testNetwork: event.target.checked});
                        debugService.testNetwork = event.target.checked;
                    }}
                    value="checkedA"
                />
            </div>
        )
    }
}