import React, { Component } from 'react'
import {idService} from "../../service/IdService";
import firebase from 'firebase';
import {Dialog, FlatButton, FloatingActionButton, TextField} from "material-ui";
import ImageUploaderDropZone from "../ImageUploaderDropZone/ImageUploaderDropZone";
import ContentAdd from 'material-ui/svg-icons/content/add';
import {firebaseAuthService} from "../../service/FirebaseAuthService";

export default class CreateMemeDialogFab extends Component {
    dataBase = "memes"
    state = {
        title: "",
        open: false,
        iid: null,
        logged:false
    }

    componentDidMount () {
        this.removeListener = firebaseAuthService.firebaseAuth().onAuthStateChanged((user) => {
            this.setState({
                logged: user?true:false
            });
        })
    }

    componentWillUnmount () {
        this.removeListener();
    }

    post = () => { //use this form to have acces to this
        console.log(this.state.imageURL);
        console.log(this.state.title);
        var user = firebase.auth().currentUser;
        firebase.database().ref(this.dataBase+'/' + idService.makeid()).set({
            iid: this.state.iid,
            uid: user.uid,
            title:this.state.title
        });
        this.handleClose();
    }
    popupCreateMeme = () => {
        this.setState({open: true});
    }
    handleChange = (event) => {
        this.setState({
            title: event.target.value,
        });
    };
    handleOpen = () => {
        this.setState({open: true});
    };

    handleClose = () => {
        this.setState({open: false});
    };

    onImageLoaded = (image) => {
        this.setState({iid: image.iid});
    };
    render () {
        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onClick={this.handleClose}
            />,
            <FlatButton
                label="Submit"
                primary={true}
                onClick={this.post}
            />,
        ];
        const style = {
            margin: 0,
            top: 'auto',
            right: 20,
            bottom: 20,
            left: 'auto',
            position: 'fixed',
        };
        return (
            <div>
                <Dialog
                    title="Post"
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={this.handleClose}
                >
                    <TextField
                        id="text-field-controlled"
                        value={this.state.title}
                        hintText="Title"
                        onChange={this.handleChange}
                    />
                    <ImageUploaderDropZone onImageLoaded={this.onImageLoaded} />
                </Dialog>

                {this.state.logged &&
                    <FloatingActionButton
                        onClick={this.popupCreateMeme}
                        style={style}>
                        <ContentAdd/>
                    </FloatingActionButton>
                }
            </div>
        )
    }
}