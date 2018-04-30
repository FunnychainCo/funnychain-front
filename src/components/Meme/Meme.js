import React, {Component} from 'react'
import firebase from 'firebase';
import {Card, CardHeader, CardMedia, CardTitle, CircularProgress} from "material-ui";
import ImagesLoaded from 'react-images-loaded';
import "./Meme.css"


/**
 * take props.meme
 * format
 * {
 * iid:string
 * uid:string
 * }
 */
export default class Meme extends Component {
    imageDataBase = "images"
    userDataBase = "users"

    state={
        imageLoaded:false,
        fullyLoaded:false,
        image:null,
        user:null,
        meme:null
    }

    computeFullyLoaded(){
        if(this.state.image && this.state.user && this.state.imageLoaded){
            this.setState({fullyLoaded:true});
        }
    }

    componentDidMount() {
        var meme = this.props.meme;
        this.setState({meme:meme});
        //load image data
        firebase.database().ref(this.imageDataBase+"/"+meme.iid).on("value", (image) => {
            var imageValue = image.val();
            this.setState({image:imageValue});
            this.computeFullyLoaded();
            //load user data
            firebase.database().ref(this.userDataBase+"/"+meme.uid).on("value", (user) => {
                var userValue = user.val();
                this.setState({user:userValue});
                this.computeFullyLoaded();
            });
        });
    }

    onImageLoded(){
        this.setState({imageLoaded:true});
        this.computeFullyLoaded();
    };

    render() {
        return <div>
                {this.state.fullyLoaded &&
                <Card>
                    <CardHeader title={this.state.user.info.email}/>
                    <CardMedia overlay={<CardTitle title={this.state.meme.title}/>}>
                        <img src={this.state.image.url} alt=""/>
                    </CardMedia>
                </Card>
                }
                {(!this.state.imageLoaded && this.state.image) &&
                <ImagesLoaded
                    done={() => {this.onImageLoded()}}
                    background=".image">
                    <img className="memeImage" src={this.state.image.url} alt=""/>
                </ImagesLoaded>
                }
                {!this.state.fullyLoaded &&
                <CircularProgress size={80} thickness={5}/>
                }
            </div>
    }
}