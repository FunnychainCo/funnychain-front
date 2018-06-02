import {Component} from 'react'
import "./Meme.css"
import * as React from 'react';


export default class UserCommentImage extends Component<{
    src: string,
}, {}> {

    render() {
        return <img className="memeCommentContainerRightMarkdownImage" src={this.props.src} alt="image comment" />
    }

}
