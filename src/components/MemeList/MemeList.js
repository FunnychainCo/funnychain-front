import React, {Component} from 'react'
import firebase from 'firebase';
import CreateMemeDialogFab from "../CreateMemeDialogFab/CreateMemeDialogFab";
import Meme from "../Meme/Meme";
import "./MemeList.css"

export default class MemeList extends Component {
    memeDataBase = "memes"
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
                this.state.memes[key] = meme;
                this.forceUpdate();
            })
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    }

    render() {
        return  <div className="fcContainerScroll scrollbar">
            <div className="memes fcContentScroll">
                {
                    Object.keys(this.state.memes).reverse().map((key) => {
                        return <Meme key={key} meme={this.state.memes[key]} />
                    })
                }
                <CreateMemeDialogFab/>
            </div>
        </div>
    }

    /**
     {
         Object.keys(this.state.memes).reverse().map((key) => {
             return <Meme key={key} meme={this.state.memes[key]} />
         })
     }
     <CreateMemeDialogFab/>
     *
     */
}