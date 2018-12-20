import * as React from 'react'
import {Component} from 'react'
import ImagesLoaded from 'react-images-loaded';
import Dropzone from 'react-dropzone'
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import './ImageUploaderDropZone.css';
import * as MobileDetect from 'mobile-detect'
import {authService} from "../../service/generic/AuthService";
import {USER_ENTRY_NO_VALUE} from "../../service/generic/UserEntry";
import CircularProgress from "@material-ui/core/CircularProgress";
import {setInterval} from "timers";
import {audit} from "../../service/Audit";
import {userNotificationService} from "../../service/UserNotificationService";

export interface IState {
    files: any[],
    filename: string,
    isUploading: boolean,
    progress: number,
    fileURL: string,
    imageStatus: string,
    acceptedFiles: string[],
    mobile: any
}

export default class ImageUploaderDropZone extends Component<{
    acceptedFiles?: string[],
    onImageLoaded: (state: string) => void,
    maxSize?: number,
    onFileToUpload: (file: File) => Promise<string>,
    uploadProgress: number
}, any> {
    state: IState = {
        files: [],
        filename: '',
        isUploading: false,
        progress: 0,
        fileURL: '',
        imageStatus: '',
        acceptedFiles: this.props.acceptedFiles || ['image/jpeg', 'image/png'],
        mobile: null
    };

    uid: string = "";
    private removeListener: () => void;
    private removeInterval: NodeJS.Timer;

    componentDidMount() {
        let md = new MobileDetect(window.navigator.userAgent);
        this.setState({mobile: md.mobile()});
        console.log("device type (null = web browser) :" + md.mobile());
        this.removeListener = authService.onAuthStateChanged((user) => {
            if (user != USER_ENTRY_NO_VALUE) {
                this.uid = user.uid
            } else {
                this.uid = "";
            }
        });
        this.removeInterval = setInterval(() => {
            if (this.state.progress < this.props.uploadProgress) {
                this.setState({progress: this.state.progress + 1});
            }
        }, 100);
    }

    componentWillUnmount() {
        clearInterval(this.removeInterval);
        this.removeListener();
    }

    handleUploadStart = () => this.setState({isUploading: true, progress: 0});

    handleProgress = (progress) => {
        console.warn(progress);
        this.setState({progress});
    };

    handleUploadError = (error) => {
        this.setState({isUploading: false});
        audit.reportError(error);
    };

    handleOnAlways = (instance) => {
    };

    handleOnProgress = (instance, image) => {
        console.warn(instance, image);
    };

    handleOnFail = (instance) => {
    };

    handleDone = (instance) => {
        this.setState({isUploading: false});
        this.props.onImageLoaded(this.state.fileURL);
    };

    onDrop = (files) => {
        if (files.length !== 1) {
            userNotificationService.notifyUIToNotifyUser("Cannot upload more than 1 item.");
            return;
        }
        this.setState({isUploading: true, progress: 0});
        let file = files[0];
        this.props.onFileToUpload(file).then((url: string) => {
            this.setState({fileURL: url});
        }).catch(reason => {
            userNotificationService.notifyUIToNotifyUser("Cannot upload (network error) please retry.");
            this.setState({isUploading: false, progress: 0});
            return;
        });
    };

    dropError = (files) => {
        userNotificationService.notifyUIToNotifyUser("Cannot upload image. Image is too big (>10mb) or not a a png or a jpeg");
        audit.reportError(files);
    };

    render() {
        const fileSizeLimit = this.props.maxSize || 10000000;
        /**
         *
         className={'dropZone'}
         acceptClassName={'stripes'}
         rejectClassName={'rejectStripes'}
         */
        return (
            <div className="fcImageContainerStyle">
                <form className="fcImageContainerStyle">
                    {this.state.isUploading &&
                    <div style={{
                        flexDirection: "column",
                        display: "flex",
                        justifyContent: "center ",
                        alignItems: "center",
                        height: "100px"
                    }}>
                        <CircularProgress
                            variant="static"
                            size={50}
                            value={this.state.progress}/>
                        <div>Loading data</div>
                    </div>
                    }
                    {this.state.fileURL &&
                    <ImagesLoaded
                        className="fcImageContainerStyle"
                        onAlways={this.handleOnAlways}
                        onProgress={this.handleOnProgress}
                        onFail={this.handleOnFail}
                        done={this.handleDone}
                        background=".image"
                    >
                        <img className="fcImageContainerStyle" src={this.state.fileURL} alt=""/>
                    </ImagesLoaded>
                    }
                    {(!this.state.fileURL && !this.state.isUploading) &&
                    <Dropzone
                        accept={this.state.acceptedFiles.join(',')}
                        onDropAccepted={this.onDrop}
                        multiple={false}
                        onDropRejected={this.dropError}
                        maxSize={fileSizeLimit}
                    >
                        {({getRootProps, getInputProps, isDragActive}) => {
                            return (
                                <div className='dropzoneTextStyle dropZone' {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    {(this.state.mobile == null) &&
                                    <p className={'dropzoneParagraph'}>{'Drag and drop an image file here or click'}</p>}
                                    <br/>
                                    <CloudUploadIcon className={'uploadIconSize'}/>
                                </div>
                            )
                        }}
                    </Dropzone>
                    }
                </form>
            </div>
        )
    }
}