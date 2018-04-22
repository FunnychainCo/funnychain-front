import React, { Component } from 'react'
import firebase from 'firebase';
import FileUploader from 'react-firebase-file-uploader';
import {makeid} from "../../service/idService";
import {CircularProgress, Snackbar} from "material-ui";
import ImagesLoaded from 'react-images-loaded';
import Dropzone from 'react-dropzone'
import CloudUploadIcon from 'material-ui/svg-icons/file/cloud-upload';
import './ImageUploaderDropZone.css';

export default class ImageUploaderDropZone extends Component {
    storageBase = "images"
    dataBase = "images"
    state = {
        files:[],
        filename: '',
        isUploading: false,
        progress: 0,
        fileURL: '',
        iid:'',
        imageStatus:'',
        openSnackBar: false,
        errorMessage: '',
        acceptedFiles: this.props.acceptedFiles || ['image/jpeg', 'image/png']
    };

    handleUploadStart = () => this.setState({isUploading: true, progress: 0});
    handleProgress = (progress) => this.setState({progress});
    handleUploadError = (error) => {
        this.setState({isUploading: false});
        console.error(error);
    }
    handleUploadSuccess = (filename) => {
        this.setState({filename: filename, progress: 100});
        var user = firebase.auth().currentUser;
        firebase.storage().ref(this.storageBase).child(filename).getDownloadURL().then((url) =>{
            var fileId = filename.replace(/\.[^/.]+$/, "");
            this.setState({fileURL: url,iid:fileId});
            firebase.database().ref(this.dataBase+'/' + fileId).set({
                url: url,
                uid: user.uid
            });
        });
    };

    handleOnAlways = (instance) => {};

    handleOnProgress = (instance, image) => {};

    handleOnFail = (instance) => {};

    handleDone = (instance) => {
        this.setState({isUploading: false});
        this.props.onImageLoaded(this.state);
    };

    onDrop(files) {
        if(files.length!=1){
            this.setState({
                openSnackBar: true,
                errorMessage: 'Cannot upload more than 1 item.',
            });
        }
        this.setState({isUploading: true, progress: 0});
        var file = files[0];
        var metadata = {
            contentType: file.type,
        };
        var user = firebase.auth().currentUser;
        var ref = firebase.storage().ref(this.storageBase);
        var filename = makeid();
        ref.child(filename).put(file,metadata).then(()=>{
            ref.child(filename).getDownloadURL().then((url) =>{
                var fileId = filename.replace(/\.[^/.]+$/, "");
                this.setState({fileURL: url,iid:fileId});
                firebase.database().ref(this.dataBase+'/' + fileId).set({
                    url: url,
                    uid: user.uid
                });
            });
        })
    }

    onDropRejected() {
        this.setState({
            openSnackBar: true,
            errorMessage: 'File too big, max size is 3MB',
        });
    }

    handleRequestCloseSnackBar = () => {
        this.setState({
            openSnackBar: false,
        });
    };

    render () {
        const fileSizeLimit = this.props.maxSize || 3000000;
        return (
            <div>
                <form>
                    {this.state.isUploading &&
                        <CircularProgress size={200} thickness={10} />
                    }
                    {this.state.fileURL &&
                        <ImagesLoaded
                            onAlways={this.handleOnAlways}
                            onProgress={this.handleOnProgress}
                            onFail={this.handleOnFail}
                            done={this.handleDone}
                            background=".image" // true or child selector
                        >
                            <img src={this.state.fileURL} alt="" />
                        </ImagesLoaded>
                    }
                    {(!this.state.fileURL && !this.state.isUploading) &&
                        <Dropzone
                            accept={this.state.acceptedFiles.join(',')}
                            onDrop={this.onDrop.bind(this)}
                            className={'dropZone'}
                            acceptClassName={'stripes'}
                            rejectClassName={'rejectStripes'}
                            onDropRejected={this.onDropRejected.bind(this)}
                            maxSize={fileSizeLimit}
                        >
                            <div className={'dropzoneTextStyle'}>
                                <p className={'dropzoneParagraph'}>{'Drag and drop an image file here or click'}</p>
                                <br/>
                                <CloudUploadIcon className={'uploadIconSize'}/>
                            </div>
                        </Dropzone>
                    }
                    <Snackbar
                        open={this.state.openSnackBar}
                        message={this.state.errorMessage}
                        autoHideDuration={4000}
                        onRequestClose={this.handleRequestCloseSnackBar}
                    />
                </form>
            </div>
        )
    }
}