import React, {Component} from 'react'
import PropTypes from 'prop-types';
import {Dialog} from "material-ui";
import "./ModalPage.css";
import {withMobileDialog} from "material-ui";

class ModalPage extends Component {
    render() {
        const { fullScreen } = this.props;
        return (
            <Dialog
                fullScreen={fullScreen}
                title={this.props.title}
                open={this.props.open}
                onClose={this.props.onRequestClose}
                actions={this.props.actions}
            >
                {this.props.children}
            </Dialog>
        )
    }
}

ModalPage.propTypes = {
    fullScreen: PropTypes.bool.isRequired,
};

export default withMobileDialog()(ModalPage);