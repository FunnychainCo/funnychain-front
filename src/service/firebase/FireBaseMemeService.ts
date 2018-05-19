import * as firebase from 'firebase';
import {idService} from "../IdService";

interface FirebaseMeme{
    title:string,
    iid:string,
    uid: string,
    created: string
}

interface FirebaseUser{
    uid:string
}

export class FireBaseMemeService {
    dataBase = "memes"

    on(callback:(memes:{[id:string] : FirebaseMeme}) => void) : () => void {
        let ref = firebase.database().ref(this.dataBase);
        let toremove = ref.on("value", (memes) => {
            if(memes==null){
                console.error(memes);
                return;
            }
            let memesValue:{[id:string] : FirebaseMeme} = memes.val() || {};
            callback(memesValue);
        }, (errorObject) => {
            console.log("The read failed: " + errorObject.code);
        });
        //return remove listener function
        return () => {
            ref.off("value",toremove);
        };
    }

    createMeme(meme:FirebaseMeme) {
        let currentUser = firebase.auth().currentUser;
        if(currentUser==null){
            console.error(currentUser);
            return;
        }
        let user:FirebaseUser = currentUser;
        meme.uid = user.uid;//ensure ownership of meme
        meme.created = new Date().toString();//ensure creation date of meme
        return new Promise((resolve) => {
            console.log(meme);
            firebase.database().ref(this.dataBase + '/' + idService.makeid()).set(meme);
        });
    }

}

export let fireBaseMemeService = new FireBaseMemeService();
