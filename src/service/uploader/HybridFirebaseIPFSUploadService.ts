import * as firebase from 'firebase';
import {GLOBAL_PROPERTIES} from "../../properties/properties";
import axios from 'axios';
import {FileUploadServiceInterface, UploadedDataInterface} from "../generic/ApplicationInterface";
import {idService} from "../IdService";
import {audit} from "../Audit";

export class HybridFirebaseIPFSUploadService implements FileUploadServiceInterface {
    uploadBuffer(buffer: Buffer, progress: (progressPercent: number) => void): Promise<UploadedDataInterface> {
        throw new Error();
    }

    storageBase = "temp";
    uploadFile(file: File): Promise<UploadedDataInterface> {
        return new Promise<UploadedDataInterface>((resolve, reject) => {
            let filename = idService.makeid();
            let ref = firebase.storage().ref(this.storageBase);
            let metadata = {
                contentType: file.type,
            };
            ref.child(filename).put(file, metadata).then(() => {
                ref.child(filename).getDownloadURL().then((url) => {
                    axios.get(GLOBAL_PROPERTIES.URL_UPLOAD_SERVICE()+"/"+encodeURIComponent(url)).then((resp) => {
                        let uploadedDataInterface: UploadedDataInterface = {
                            fileURL: resp.data.fileURL,
                            fileId: resp.data.fileId
                        };
                        resolve(uploadedDataInterface);
                    }).catch((err) => {
                        audit.error("HybridFirebaseIPFSUploadService upload failed",err);
                        reject("HybridFirebaseIPFSUploadService upload failed");
                    });
                }).catch(err=>{
                    reject(err);
                });
            }).catch(err=>{
                reject(err);
            });
        });
    }

}

export let hybridFirebaseIPFSUploadService = new HybridFirebaseIPFSUploadService();
