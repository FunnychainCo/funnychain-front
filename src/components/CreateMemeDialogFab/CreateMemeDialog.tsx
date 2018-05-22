import {Component} from 'react'
import * as React from 'react'
import {TextField} from "material-ui";
import ImageUploaderDropZone from "../ImageUploaderDropZone/ImageUploaderDropZone";
import {userNotificationService} from "../../service/UserNotificationService";
import {fileUploadService} from "../../service/generic/FileUploadService";
import {DialogContent} from "material-ui";
import {DialogActions} from "material-ui";
import {DialogTitle} from "material-ui";
import ModalPage from "../ModalPage/ModalPage";
import Button from "@material-ui/core/Button/Button";
import {memeService} from "../../service/generic/MemeService";


export default class CreateMemeDialog extends Component<{
    open: boolean,
    handleClose: () => void
}, {
    title: string,
    imageURL: string,
    valid: boolean
}> {

    state = {
        title: "",
        imageURL: "",
        valid: false
    };

    titleValid: boolean = false;
    imageValid: boolean = false;

    post = () => { //use this form to have acces to this
        if (this.state.imageURL === null || this.state.imageURL === "") {
            userNotificationService.notifyUser("A image is required");
        }
        if (this.state.title === null || this.state.title.replace(" ", "") === "") {
            userNotificationService.notifyUser("A title is required");
        }

        memeService.post(this.state.title, this.state.imageURL).then(() => {
            this.props.handleClose();
        });
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

    handleChange = (ref) => {
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
                    <ImageUploaderDropZone
                        onImageLoaded={this.onImageLoaded}
                        onFileToUpload={(file: File) => {
                            return new Promise<string>((resolve, reject) => {
                                fileUploadService.uploadFile(file).then((data) => {
                                    resolve(data.fileURL);
                                });
                            });
                        }}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={this.props.handleClose}>Cancel</Button>
                    <Button onClick={() => {
                        this.post();
                    }}
                            disabled={!this.state.valid}
                    >Submit</Button>
                </DialogActions>
            </ModalPage>
        )
    }
}