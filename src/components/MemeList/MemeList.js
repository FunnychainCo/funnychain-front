import React, {Component} from 'react'
import firebase from 'firebase';
import {Card, CardHeader, CardMedia, CardTitle} from "material-ui";
import CreateMemeDialogFab from "../CreateMemeDialogFab/CreateMemeDialogFab";

export default class MemeList extends Component {
    memeDataBase = "memes"
    imageDataBase = "images"
    userDataBase = "users"
    state = {
        memes: {}
    }

    componentDidMount() {
        var ref = firebase.database().ref(this.memeDataBase);
        ref.on("value", (memes) => {
            var memesValue = memes.val() || {};
            var itemsKeys = Object.keys(memesValue);
            itemsKeys.forEach((key) => {
                var meme = memesValue[key];
                //load image data
                firebase.database().ref(this.imageDataBase+"/"+meme.iid).on("value", (image) => {
                    var imageValue = image.val();
                    //load user data
                    firebase.database().ref(this.userDataBase+"/"+meme.uid).on("value", (user) => {
                        var userValue = user.val();
                        //update the state
                        this.state.memes[key] = meme;
                        this.state.memes[key].user = userValue;
                        this.state.memes[key].image = imageValue;
                        this.forceUpdate();
                    });
                });
            })
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    }

    render() {
        return (
            <div>
                {
                    Object.keys(this.state.memes).map((key) => {
                        return <Card key={key}>
                                <CardHeader title={this.state.memes[key].user.info.email}/>
                                <CardMedia overlay={<CardTitle title={this.state.memes[key].title}/>}>
                                    <img src={this.state.memes[key].image.url} alt="" />
                                </CardMedia>
                            </Card>
                    })
                }
                <CreateMemeDialogFab />
            </div>);
    }
}