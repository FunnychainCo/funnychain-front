import React, { Component } from 'react'
import firebase from 'firebase';
import FileUploader from 'react-firebase-file-uploader';
import {makeid} from "../service/idService";

export default class ImageUploader extends Component {
    storageBase = "images"
    dataBase = "images"
    state = {
        filename: '',
        isUploading: false,
        progress: 0,
        fileURL: '',
        iid:''
    };

    componentDidMount() {
        this.props.onRef(this)
    }
    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    handleUploadStart = () => this.setState({isUploading: true, progress: 0});
    handleProgress = (progress) => this.setState({progress});
    handleUploadError = (error) => {
        this.setState({isUploading: false});
        console.error(error);
    }
    handleUploadSuccess = (filename) => {
        this.setState({filename: filename, progress: 100, isUploading: false});
        var user = firebase.auth().currentUser;
        firebase.storage().ref(this.storageBase).child(filename).getDownloadURL().then((url) =>{
            var fileId = filename.replace(/\.[^/.]+$/, "");
            this.setState({fileURL: url,iid:fileId})
            firebase.database().ref(this.dataBase+'/' + fileId).set({
                url: url,
                uid: user.uid
            });
        });
    };

    render () {
        return (
            <div>
                <form>
                    {this.state.isUploading &&
                    <p>Progress: {this.state.progress}</p>
                    }
                    {this.state.fileURL &&
                    <img src={this.state.fileURL} />
                    }
                    <label style={{backgroundColor: 'steelblue', color: 'white', padding: 10, borderRadius: 4, pointer: 'cursor'}}>
                        Select a meme
                        <FileUploader
                            hidden
                            accept="image/*"
                            filename={file => makeid() }
                            storageRef={firebase.storage().ref(this.storageBase)}
                            onUploadStart={this.handleUploadStart}
                            onUploadError={this.handleUploadError}
                            onUploadSuccess={this.handleUploadSuccess}
                            onProgress={this.handleProgress}
                        />
                    </label>
                </form>
            </div>
        )
    }
}