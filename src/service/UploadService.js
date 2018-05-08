import firebase from 'firebase';
import {mediaService} from "./MediaService";
import {idService} from "./IdService";

export class UploadService {
    storageBase = "images"

    uploadFile(file,metadata){
        return new Promise(((resolve, reject) => {
            var filename = idService.makeid();
            var user = firebase.auth().currentUser;
            var ref = firebase.storage().ref(this.storageBase);
            ref.child(filename).put(file, metadata).then(() => {
                ref.child(filename).getDownloadURL().then((url) => {
                    mediaService.createMediaEntry(url, user.uid).then((fileId) => {
                        resolve({fileURL: url, iid: fileId});
                    });
                });
            });
        }));
    }

}

export var uploadService = new UploadService();
