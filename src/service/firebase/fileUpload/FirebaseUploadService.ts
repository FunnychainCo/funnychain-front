import * as firebase from 'firebase';
import {firebaseMediaService} from "./FirebaseMediaService";
import {idService} from "../../IdService";
import {FileUploadServiceInterface, UploadedDataInterface} from "../../generic/ApplicationInterface";
import {DATABASE_MEDIA} from "../shared/FireBaseDBDefinition";

export class FirebaseUploadService implements FileUploadServiceInterface{
    storageBase = DATABASE_MEDIA;

    uploadFile(file:File):Promise<UploadedDataInterface> {
        return new Promise<UploadedDataInterface>(((resolve, reject) => {
            let filename = idService.makeid();
            let user:any = firebase.auth().currentUser;
            let ref = firebase.storage().ref(this.storageBase);
            let metadata = {
                contentType: file.type,
            };
            ref.child(filename).put(file, metadata).then(() => {
                ref.child(filename).getDownloadURL().then((url) => {
                    firebaseMediaService.createMediaEntry(url, user.uid).then((fileId:string) => {
                        let uploadedDataInterface:UploadedDataInterface = {
                            fileURL: url,
                            fileId: fileId
                        };
                        resolve(uploadedDataInterface);
                    });
                });
            });
        }));
    }

}

export let firebaseUploadService = new FirebaseUploadService();
