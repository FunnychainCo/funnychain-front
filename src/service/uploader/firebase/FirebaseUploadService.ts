import * as firebase from 'firebase';
import {idService} from "../../IdService";
import {FileUploadServiceInterface, UploadedDataInterface} from "../../generic/ApplicationInterface";
import {DATABASE_MEDIA} from "../../database/shared/DBDefinition";

export class FirebaseUploadService implements FileUploadServiceInterface {
    uploadBuffer(buffer: Buffer, progress: (progressPercent: number) => void): Promise<UploadedDataInterface> {
        throw new Error();
    }

    storageBase = DATABASE_MEDIA;

    uploadFile(file: File): Promise<UploadedDataInterface> {
        return new Promise<UploadedDataInterface>(((resolve, reject) => {
            let filename = idService.makeid();
            let ref = firebase.storage().ref(this.storageBase);
            let metadata = {
                contentType: file.type,
            };
            ref.child(filename).put(file, metadata).then(() => {
                ref.child(filename).getDownloadURL().then((url) => {
                    let uploadedDataInterface: UploadedDataInterface = {
                        fileURL: url,
                        fileId: url
                    };
                    resolve(uploadedDataInterface);
                });
            });
        }));
    }

}

export let firebaseUploadService = new FirebaseUploadService();
