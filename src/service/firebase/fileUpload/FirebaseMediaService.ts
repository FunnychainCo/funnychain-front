import * as firebase from 'firebase';
import {idService} from "../../IdService";
import {DATABASE_MEDIA, MediaEntry} from "../shared/FireBaseDBDefinition";
import {imageService} from "../../ImageService";

export default class MediaService {

    imageDataBase = DATABASE_MEDIA;

    createMediaEntry(url, ownerUid):Promise<string> {
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
                imageService.preLoadImage(imageValue.url).then(() => {
                    resolve(imageValue);
                });
            });
        });
    }

}

export let firebaseMediaService = new MediaService();
