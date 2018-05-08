import React, {Component} from 'react'
import {Card, CardHeader, CardMedia, CardTitle, CircularProgress} from "material-ui";
import ImagesLoaded from 'react-images-loaded';
import "./Meme.css"
import {authService} from "../../service/AuthService";
import {mediaService} from "../../service/MediaService";


/**
 * take props.meme
 * format
 * {
 * iid:string
 * uid:string
 * }
 */
export default class Meme extends Component {
    state = {
        imageLoaded: false,
        fullyLoaded: false,
        image: null,
        user: null,
        meme: null
    }

    computeFullyLoaded() {
        if (this.state.image && this.state.user && this.state.imageLoaded) {
            this.setState({fullyLoaded: true});
        }
    }

    componentDidMount() {
        var meme = this.props.meme;
        this.setState({meme: meme});
        //load image data
        mediaService.loadMediaEntry(meme.iid).then(imageValue => {
            this.setState({image: imageValue});
            this.computeFullyLoaded();
            //load user data
            authService.loadUserData(meme.uid).then((userValue) => {
                this.setState({user: userValue});
                this.computeFullyLoaded();
            });
        });
    }

    onImageLoded() {
        this.setState({imageLoaded: true});
        this.computeFullyLoaded();
    };

    render() {
        return <div>
            {this.state.fullyLoaded &&
            <Card>
                <CardHeader title={this.state.user.displayName} avatar={this.state.user.avatar.url}/>
                <CardMedia overlay={<CardTitle title={this.state.meme.title}/>}>
                    <img src={this.state.image.url} alt=""/>
                </CardMedia>
            </Card>
            }
            {(!this.state.imageLoaded && this.state.image) &&
            <ImagesLoaded
                done={() => {
                    this.onImageLoded()
                }}
                background=".image">
                <img className="memeImage" src={this.state.image.url} alt=""/>
            </ImagesLoaded>
            }
            {!this.state.fullyLoaded &&
            <div>
                <CircularProgress size={120} thickness={5}/>
            </div>
            }
        </div>
    }
}