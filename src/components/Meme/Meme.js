import React, {Component} from 'react'
import {Card, CardHeader, CircularProgress} from "material-ui";
import ImagesLoaded from 'react-images-loaded';
import "./Meme.css"
import {authService} from "../../service/AuthService";
import {mediaService} from "../../service/MediaService";
import {Avatar} from "material-ui";


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
        meme: null,
        insecure : false
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
            if(!imageValue.url.startsWith("https://")){
                //do not display insecure meme it breaks the https of app
                this.setState({insecure: true});
            }
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
            {(this.state.fullyLoaded && ! this.state.insecure) &&
            <Card>
                <CardHeader
                    title={this.state.user.displayName}
                    avatar={
                        <Avatar alt={this.state.user.displayName} src={this.state.user.avatar.url} />
                    }
                />
                <img className="memeImage" src={this.state.image.url} alt=""/>
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
            {(!this.state.fullyLoaded && ! this.state.insecure) &&
            <div>
                <CircularProgress size={120} thickness={5}/>
            </div>
            }
        </div>
    }
}