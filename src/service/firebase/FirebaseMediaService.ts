import * as firebase from 'firebase';
import {idService} from "../IdService";

interface MediaEntry {
    uid:string,
    url:string
}

export default class MediaService {

    imageDataBase = "images"

    createMediaEntry(url, ownerUid) {
        return new Promise((resolve) => {
            let fileId = idService.makeid();
            firebase.database().ref(this.imageDataBase + '/' + fileId).set({
                url: url,
                uid: ownerUid
            }).then(() => {
                resolve(fileId);
            });
        });
    }

    preLoadImage(src:string):Promise<string> {
        return new Promise<string>((resolve,reject) =>{
            let image = new Image();
            image.src = src;
            image.onload = () => {
                //console.log("loaded image: "+src);
                resolve(src);
            };
            image.onerror = (e) => {
                reject(e);
            };
        })
    }

    loadMediaEntry(iid:string):Promise<MediaEntry> {
        return new Promise<MediaEntry>((resolve,reject) => {
            firebase.database().ref(this.imageDataBase + "/" + iid).on("value", (image) => {
                if(image==null){
                    reject("image is null");
                    return;
                }
                let imageValue:MediaEntry = image.val();
                if(imageValue==null){
                    reject(iid);
                    return;
                }
                this.preLoadImage(imageValue.url).then(()=>{
                    resolve(imageValue);
                });
            });
        });
    }

}

export let firebaseMediaService = new MediaService();
