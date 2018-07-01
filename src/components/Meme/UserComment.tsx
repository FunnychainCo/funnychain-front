import {Component} from 'react'
import "./Meme.css"
import {MemeComment} from "../../service/generic/ApplicationInterface";
import * as React from 'react';
//import CardHeader from "@material-ui/core/CardHeader/CardHeader";
import Avatar from "@material-ui/core/Avatar/Avatar";
import UserCommentImage from "./UserCommentImage";

const ReactMarkdown = require('react-markdown')


export default class UserComment extends Component<{
    comment: MemeComment,
}, {}> {
    render() {
        return <div className="memeCommentContainer">
            <div className="memeCommentContainerLeft">
                <Avatar alt={this.props.comment.author.displayName}
                        src={this.props.comment.author.avatarUrl}/>
            </div>
            <div className="memeCommentContainerRight">
                <strong>{this.props.comment.author.displayName}</strong>
                <ReactMarkdown
                    className="memeCommentContainerRightMarkdown"
                    source={this.props.comment.text}
                    renderers ={{
                        image: UserCommentImage
                    }}
                />
            </div>
        </div>
    }

}

/**
 <CardHeader
 style={{alignItems: "start"}}
 avatar={
                <Avatar alt={this.props.comment.author.displayName}
                        src={this.props.comment.author.avatarUrl}/>
            }
 title={this.props.comment.author.displayName}
 subheader={<ReactMarkdown source={this.props.comment.text}/>}
 />
 */