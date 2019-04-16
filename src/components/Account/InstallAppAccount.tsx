import * as React from 'react'
import {Component} from 'react'
import {CellphoneArrowDown} from 'mdi-material-ui'; //https://materialdesignicons.com/
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {Link} from 'react-router-dom';


export default class InstallAppAccount extends Component<{}, {
}> {
    state = {
    };

    componentWillMount(){
    }

    componentWillUnmount() {
    }

    render() {
        const installLink = (props) => <Link to={"/install"} {...props} />;
        return (

            <div className="fcContent">
                <ListItem button component={installLink} onClick={() => {}}><CellphoneArrowDown/><ListItemText primary="Install"/>
                </ListItem>
            </div>
        )
    }
}