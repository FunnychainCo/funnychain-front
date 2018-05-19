import {Component} from 'react'
//import * as ImagesLoaded from 'react-images-loaded';
import "./Meme.css"
import {Meme} from "../../service/generic/MemeService";
import * as React from 'react';
import Card from "@material-ui/core/Card/Card";
import CardHeader from "@material-ui/core/CardHeader/CardHeader";


interface PropsType{
    meme:Meme
}

interface StateType{
    meme: Meme
}

export default class MemeComponent extends Component<PropsType,StateType> {
    state = {
        meme: {
            id:"",
            uid:"",
            user:{
                uid: "",
                avatarIid: "",
                displayName: "",
                email: "",
                avatar: {}
            },
            title:"",
            imageUrl:"",
            created:new Date()
        }
    };

    componentDidMount() {
        var meme = this.props.meme;
        this.setState({meme: meme});
    }

    render() {
        return <Card>
                <CardHeader
                    title={this.state.meme.title}
                />
                <img className="memeImage" src={this.state.meme.imageUrl} alt=""/>
            </Card>
    }
}