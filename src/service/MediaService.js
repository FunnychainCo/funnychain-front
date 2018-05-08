import firebase from 'firebase';
import {idService} from "./IdService";

export class MediaService {

    imageDataBase = "images"

    createMediaEntry(url, ownerUid) {
        return new Promise((resolve) => {
            var fileId = idService.makeid();
            firebase.database().ref(this.imageDataBase + '/' + fileId).set({
                url: url,
                uid: ownerUid
            }).then(() => {
                resolve(fileId);
            });
        });
    }

    loadMediaEntry(iid) {
        return new Promise(resolve => {
            firebase.database().ref(this.imageDataBase + "/" + iid).on("value", (image) => {
                var imageValue = image.val();
                resolve(imageValue);
            });
        });
    }

}

export var mediaService = new MediaService();
