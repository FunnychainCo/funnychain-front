import * as React from 'react';
import {Component} from 'react';
import withMobileDialog from "@material-ui/core/withMobileDialog/withMobileDialog";
import HeaderClassic from "../Header/HeaderClassic";

class FullPageWithHeader extends Component<{
    title: string,
    open: boolean,
    onRequestClose: () => void
}, any> {
    render() {
        //const {fullScreen}: any = this.props;
        return (<React.Fragment>
                <HeaderClassic/>
                <div>{/*add div to have the button right after the text field*/}
                    {this.props.children}
                </div>
            </React.Fragment>
        )
    }
}


export default withMobileDialog<any>()(FullPageWithHeader);