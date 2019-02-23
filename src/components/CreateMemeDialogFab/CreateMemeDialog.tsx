import * as React from 'react'
import {Component} from 'react'
import ImageUploaderDropZone from "../ImageUploaderDropZone/ImageUploaderDropZone";
import {userNotificationService} from "../../service/notification/UserNotificationService";
import {fileUploadService} from "../../service/generic/FileUploadService";
import ModalPage from "../ModalPage/ModalPage";
import Button from "@material-ui/core/Button/Button";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import TextField from "@material-ui/core/TextField/TextField";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import {authService} from "../../service/generic/AuthService";
import {withStyles} from '@material-ui/core/styles';
import LoadingButton from "./LoadingButton";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import SwipeableViews from 'react-swipeable-views';
import Typography from "@material-ui/core/Typography";
import MemeCreator from "./MemeCreator";

const styles: any = theme => ({});

function TabContainer({children}) {
    return (
        <Typography component="div" style={{padding: 8 * 3}}>
            {children}
        </Typography>
    );
}

class CreateMemeDialog extends Component<{
    classes: any
    open: boolean,
    handleClose: () => void
}, {
    title: string,
    imageURL: string,
    valid: boolean,
    progress: number,
    postLoading: boolean
    value: number,
}> {

    state = {
        title: "",
        imageURL: "",
        valid: false,
        progress: 0,
        postLoading: false,
        value: 0,
    };

    titleValid: boolean = false;
    imageValid: boolean = false;

    post = () => { //use this form to have acces to this
        this.setState({postLoading: true});
        if (this.state.imageURL === null || this.state.imageURL === "") {
            userNotificationService.sendNotificationToUser("A image is required!");
        }
        if (this.state.title === null || this.state.title.replace(" ", "") === "") {
            userNotificationService.sendNotificationToUser("A title is required");
        }

        authService.getUserAction().post(this.state.title, this.state.imageURL).then(() => {
            this.setState({postLoading: false});
            this.props.handleClose();
        });
    };

    handleChange = (event, value) => {
        this.setState({value});
    };

    handleChangeIndex = index => {
        this.setState({value: index});
    };

    handleTextFieldChange = (event) => {
        let newTitle = event.target.value;
        this.setState({
            title: newTitle,
        });
        if (newTitle === null || newTitle.replace(" ", "") === "") {
            this.titleValid = false;
        } else {
            this.titleValid = true;
        }
        this.setState({valid: this.imageValid && this.titleValid});
    };

    onImageLoaded = (url: string) => {
        this.setState({imageURL: url});
        if (this.state.imageURL === null || this.state.imageURL === "") {
            this.imageValid = false;
        } else {
            this.imageValid = true;
        }
        this.setState({valid: this.imageValid && this.titleValid});
    };

    render() {
        return (
            <ModalPage
                open={this.props.open}
                onClose={this.props.handleClose}
            >
                <DialogTitle>Post</DialogTitle>
                <DialogContent>
                    <TextField
                        id="text-field-controlled"
                        value={this.state.title}
                        label="Title"
                        onChange={this.handleTextFieldChange}
                        fullWidth
                    />
                    <br/>
                    <br/>
                    <Tabs
                        value={this.state.value}
                        onChange={this.handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                    >
                        <Tab label="Image"/>
                        <Tab label="Create Meme"/>
                    </Tabs>
                    <SwipeableViews
                        index={this.state.value}
                        onChangeIndex={this.handleChangeIndex}
                    >
                        <TabContainer>
                            <ImageUploaderDropZone
                                uploadProgress={this.state.progress}
                                onImageLoaded={this.onImageLoaded}
                                onFileToUpload={(file: File) => {
                                    return new Promise<string>((resolve, reject) => {
                                        fileUploadService.uploadFile(file, (progress) => {
                                            this.setState({progress: progress})
                                        }).then((data) => {
                                            resolve(data.fileURL);
                                        }).catch(reason => {
                                            reject(reason);
                                        });
                                    });
                                }}
                            /></TabContainer>
                        <TabContainer>
                            <div style={{width:"100%",height:"100%"}}>
                            <MemeCreator
                                visible={this.state.value==1}
                                onImageUploaded={(url)=>{
                                this.onImageLoaded(url);
                            }}/>
                            </div>
                        </TabContainer>
                    </SwipeableViews>
                </DialogContent>

                <DialogActions>
                    <Button onClick={this.props.handleClose}>Cancel</Button>
                    <LoadingButton
                        onValidation={() => {
                            this.post();
                        }}
                        loading={this.state.postLoading}
                        valid={this.state.valid}
                    />
                </DialogActions>
            </ModalPage>
        )
    }
}

export default withStyles(styles)(CreateMemeDialog);