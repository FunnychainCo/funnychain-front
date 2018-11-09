import {Component} from 'react'
import * as React from 'react'
import ImagesLoaded from 'react-images-loaded';
import Dropzone from 'react-dropzone'
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import './ImageUploaderDropZone.css';
import * as MobileDetect from 'mobile-detect'
import {authService} from "../../service/generic/AuthService";
import Snackbar from "@material-ui/core/Snackbar/Snackbar";
import {USER_ENTRY_NO_VALUE} from "../../service/generic/UserEntry";
import CircularProgress from "@material-ui/core/CircularProgress";
import {setInterval} from "timers";
import {audit} from "../../service/Audit";

export interface IState{
    files: any[],
        filename: string,
    isUploading: boolean,
    progress: number,
    fileURL: string,
    imageStatus: string,
    openSnackBar: false,
    errorMessage: string,
    acceptedFiles: string[],
    mobile: any
}

export default class ImageUploaderDropZone extends Component<{
    acceptedFiles?:string[],
    onImageLoaded:(state:string) => void,
    maxSize?:number,
    onFileToUpload:(file:File)=>Promise<string>,
    uploadProgress:number
},any> {
    state:IState = {
        files: [],
        filename: '',
        isUploading: false,
        progress: 0,
        fileURL: '',
        imageStatus: '',
        openSnackBar: false,
        errorMessage: '',
        acceptedFiles: this.props.acceptedFiles || ['image/jpeg', 'image/png'],
        mobile: null
    };

    uid:string = "";
    private removeListener: () => void;
    private removeInterval: NodeJS.Timer;

    componentDidMount() {
        let md = new MobileDetect(window.navigator.userAgent);
        this.setState({mobile: md.mobile()});
        console.log("device type (null = web browser) :" + md.mobile());
        this.removeListener = authService.onAuthStateChanged((user) => {
            if(user!=USER_ENTRY_NO_VALUE){
                this.uid = user.uid
            }else {
                this.uid = "";
            }
        });
        this.removeInterval = setInterval(()=>{
            if(this.state.progress<this.props.uploadProgress){
                this.setState({progress:this.state.progress+1});
            }
        },100);
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
        console.warn(instance,image);
    };

    handleOnFail = (instance) => {
    };

    handleDone = (instance) => {
        this.setState({isUploading: false});
        this.props.onImageLoaded(this.state.fileURL);
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
        let file = files[0];
        this.props.onFileToUpload(file).then((url:string)=>{
            this.setState({fileURL: url});
        })

        /*fileUploadService.uploadFile(file).then((data)=>{
            this.setState({fileURL: data.fileURL});
        });*/
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
                    <div style={{flexDirection:"column",display:"flex",justifyContent:"center ",alignItems:"center",height:"100px"}}>
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
                        message={<div>{this.state.errorMessage}</div>}
                        autoHideDuration={4000}
                        onClose={this.handleRequestCloseSnackBar}
                    />
                </form>
            </div>
        )
    }
}