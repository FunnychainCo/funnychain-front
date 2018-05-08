import React, { Component } from 'react'
import firebase from 'firebase';
import FileUploader from 'react-firebase-file-uploader';
import {makeid} from "../../service/IdService";
import {CircularProgress} from "material-ui";
import ImagesLoaded from 'react-images-loaded';

export default class FirebaseImageUploader extends Component {
    storageBase = "images"
    dataBase = "images"
    state = {
        filename: '',
        isUploading: false,
        progress: 0,
        fileURL: '',
        iid:'',
        imageStatus:''
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

    render () {
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
                        <label style={{
                            backgroundColor: 'steelblue',
                            color: 'white',
                            padding: 10,
                            borderRadius: 4,
                            pointer: 'cursor'
                        }}>
                            Select a meme
                            <FileUploader
                                hidden
                                accept="image/*"
                                filename={file => makeid()}
                                storageRef={firebase.storage().ref(this.storageBase)}
                                onUploadStart={this.handleUploadStart}
                                onUploadError={this.handleUploadError}
                                onUploadSuccess={this.handleUploadSuccess}
                                onProgress={this.handleProgress}
                            />
                        </label>
                    }
                </form>
            </div>
        )
    }
}