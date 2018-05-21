import * as firebase from 'firebase';
import {idService} from "../IdService";
import {preLoadImage} from "../ImageUtil";

interface MediaEntry {
    uid: string,
    url: string
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

    loadMediaEntry(iid: string): Promise<MediaEntry> {
        return new Promise<MediaEntry>((resolve, reject) => {
            firebase.database().ref(this.imageDataBase + "/" + iid).on("value", (image) => {
                if (image == null) {
                    reject("image is null");
                    return;
                }
                let imageValue: MediaEntry = image.val();
                if (imageValue == null) {
                    reject(iid);
                    return;
                }
                preLoadImage(imageValue.url).then(() => {
                    resolve(imageValue);
                });
            });
        });
    }

}

export let firebaseMediaService = new MediaService();
