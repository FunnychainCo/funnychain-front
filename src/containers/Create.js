import React, { Component } from 'react'
import ImageUploader from "../components/ImageUploader";
import firebase from 'firebase';
import {makeid} from "../service/idService";

export default class Create extends Component {
    dataBase = "memes"
    post = () => { //use this form to have acces to this
        console.log(this.image.state)
        console.log(this.title.value)
        var user = firebase.auth().currentUser;
        firebase.database().ref(this.dataBase+'/' + makeid()).set({
            iid: this.image.state.iid,
            uid: user.uid,
            title:this.title.value
        });
    }
    render () {
        return (
            <div>
                <div className="form-group">
                    <input className="form-control" ref={(ref) => this.title = ref} placeholder="Title"/>
                </div>
                <ImageUploader onRef={ref => (this.image = ref)} />
                <button onClick={this.post}>Post</button>
            </div>
        )
    }
}