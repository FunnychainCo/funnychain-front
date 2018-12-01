import * as React from 'react'
import {Component} from 'react'
import Button from "@material-ui/core/Button/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';

const styles: any = theme => ({
    root: {
        display: 'flex',
        alignItems: 'center',
    },
    wrapper: {
        margin: theme.spacing.unit,
        position: 'relative',
    },
    buttonSuccess: {
        backgroundColor: green[500],
        '&:hover': {
            backgroundColor: green[700],
        },
    },
    fabProgress: {
        color: green[500],
        position: 'absolute',
        top: -6,
        left: -6,
        zIndex: 1,
    },
    buttonProgress: {
        color: green[500],
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
});

class LoadingButton extends Component<{
    classes: any,
    onValidation: () => void,
    loading: boolean,
    valid: boolean,
}, {}> {

    state = {};

    render() {
        const {classes} = this.props;
        const buttonClassname = classNames({
            [classes.buttonSuccess]: false,
        });
        return (
            <div className={classes.wrapper}>
                <Button
                    variant="contained"
                    color="primary"
                    className={buttonClassname}
                    disabled={this.props.loading || !this.props.valid}
                    onClick={() => {
                        this.props.onValidation();
                    }}
                >
                    Submit
                </Button>
                {this.props.loading && <CircularProgress size={24} className={classes.buttonProgress}/>}
            </div>
        )
    }
}

export default withStyles(styles)(LoadingButton);