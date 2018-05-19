import React, {Component} from 'react'
import {Card, CardHeader, CircularProgress, Divider} from "material-ui";
import ImagesLoaded from 'react-images-loaded';
import "./Meme.css"
import {authService} from "../../service/AuthService";
import {mediaService} from "../../service/MediaService";
import {Avatar} from "material-ui";
import {memeProvider} from "../../service/MemeProvider";


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
        user: null,
        meme: null,
        insecure : false
    };

    componentDidMount() {
        var meme = this.props.meme;
        memeProvider.checkMemeFormat(meme);
        this.setState({meme: meme});
        authService.loadUserData(meme.uid).then((userValue) => {
            if(!meme.imageUrl.startsWith("https://")){
                //do not display insecure meme it breaks the https of app
                this.setState({insecure: true});
            }
            this.setStateAndComputeFullyLoaded({
                meme: meme,
                user: userValue
            });
        });
    }

    setStateAndComputeFullyLoaded(state) {
        if ((this.state.user||state.user) && (this.state.imageLoaded||state.imageLoaded)) {
            state['fullyLoaded'] = true;
            this.setState(state);
        }
    }

    onImageLoaded() {
        this.computeFullyLoaded({imageLoaded: true});
    };

    render() {
        return this.state.insecure?<div></div>:<div>
            {this.state.fullyLoaded &&
            <Card>
                <CardHeader
                    title={this.state.meme.title}
                />
                <img className="memeImage" src={this.state.image.url} alt=""/>
            </Card>
            }
            {!this.state.imageLoaded &&
            <ImagesLoaded
                done={() => {
                    this.onImageLoaded()
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