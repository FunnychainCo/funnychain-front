import * as React from 'react'
import {Component} from 'react'
import {debugService} from "../../service/DebugService";
import Switch from "@material-ui/core/Switch/Switch";
import {GLOBAL_PROPERTIES} from "../../properties/properties";

export default class Debug extends Component<{},{testNetwork:boolean}> {
    state={

    testNetwork: debugService.testNetwork
}
    render() {
        return (
            <div>
                <h1>debug</h1>
                <a href={GLOBAL_PROPERTIES.WALLET_SERVICE()+"/compute"} >FORCE COMPUTE HOT</a><br/>
                <a href={GLOBAL_PROPERTIES.FUNNYCHAIN_SERVICE()+"/bot/populate10"} >POPULATE 10 meme</a><br/>
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