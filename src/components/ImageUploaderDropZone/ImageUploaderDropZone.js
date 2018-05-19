import React, {Component} from 'react'
import {CircularProgress, Snackbar} from "material-ui";
import ImagesLoaded from 'react-images-loaded';
import Dropzone from 'react-dropzone'
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import './ImageUploaderDropZone.css';
import MobileDetect from 'mobile-detect'
import {authService} from "../../service/generic/AuthService";
import {uploadService} from "../../service/firebase/FirebaseUploadService";

export default class ImageUploaderDropZone extends Component {
    storageBase = "images"
    dataBase = "images"
    state = {
        files: [],
        filename: '',
        isUploading: false,
        progress: 0,
        fileURL: '',
        iid: '',
        imageStatus: '',
        openSnackBar: false,
        errorMessage: '',
        acceptedFiles: this.props.acceptedFiles || ['image/jpeg', 'image/png'],
        mobile: null
    };

    uid = null;

    componentDidMount() {
        var md = new MobileDetect(window.navigator.userAgent);
        this.setState({mobile: md.mobile()});
        console.log("device type (null = web browser) :" + md.mobile());
        this.removeListener = authService.onAuthStateChanged((user) => {
            if(user){
                this.uid = user.uid
            }else {
                this.uid = null;
            }
        });
    }

    componentWillUnmount() {
        this.removeListener();
    }

    handleUploadStart = () => this.setState({isUploading: true, progress: 0});
    handleProgress = (progress) => this.setState({progress});
    handleUploadError = (error) => {
        this.setState({isUploading: false});
        console.error(error);
    }

    handleOnAlways = (instance) => {
    };

    handleOnProgress = (instance, image) => {
    };

    handleOnFail = (instance) => {
    };

    handleDone = (instance) => {
        this.setState({isUploading: false});
        this.props.onImageLoaded(this.state);
    };

    onDrop(files) {
        if (files.length !== 1) {
            this.setState({
                openSnackBar: true,
                errorMessage: 'Cannot upload more than 1 item.',
            });
            return;
        }
        this.setState({isUploading: true, progress: 0});
        var file = files[0];
        var metadata = {
            contentType: file.type,
        };
        uploadService.uploadFile(file,metadata).then((data)=>{
            this.setState({fileURL: data.fileURL, iid: data.iid});
        });
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

    render() {
        const fileSizeLimit = this.props.maxSize || 3000000;
        return (
            <div className="fcImageContainerStyle">
                <form className="fcImageContainerStyle">
                    {this.state.isUploading &&
                    <CircularProgress size={200} thickness={10}/>
                    }
                    {this.state.fileURL &&
                    <ImagesLoaded
                        className="fcImageContainerStyle"
                        onAlways={this.handleOnAlways}
                        onProgress={this.handleOnProgress}
                        onFail={this.handleOnFail}
                        done={this.handleDone}
                        background=".image" // true or child selector
                    >
                        <img className="fcImageContainerStyle" src={this.state.fileURL} alt=""/>
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
                            {(this.state.mobile == null) &&
                            <p className={'dropzoneParagraph'}>{'Drag and drop an image file here or click'}</p>}
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