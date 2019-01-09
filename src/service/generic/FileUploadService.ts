import {FileUploadServiceInterface, UploadedDataInterface} from "../generic/ApplicationInterface";
import {ipfsFileUploadService} from "../IPFSFileUploader/IPFSFileUploadService";
import {hybridFirebaseIPFSUploadService} from "../IPFSFileUploader/HybridFirebaseIPFSUploadService";
import {audit} from "../Audit";

//import {firebaseUploadService} from "../firebase/FirebaseUploadService";

export class FileUploadService implements FileUploadServiceInterface{
    storageBase = "images"

    uploadFile(file:File,progress:(progressPercent:number)=>void):Promise<UploadedDataInterface> {
        return new Promise((resolve, reject) => {
            ipfsFileUploadService.uploadFile(file,progress).then(value => {
                resolve(value);
            }).catch(reason => {
                audit.warn("IPFS upload failed start firebase upload");
                //In case IPFS upload fails we upload to firebase (server will upload it to IPFS)
                //TODO ? firebase need to be firebase auth
                hybridFirebaseIPFSUploadService.uploadFile(file).then(value => {
                    resolve(value);
                }).catch(reason2 => {
                    audit.error(reason2);
                    reject(reason2);
                });
            });
        })
    }

    getMediaUrlFromImageID(iid:string):Promise<string>{
        return Promise.resolve(ipfsFileUploadService.convertIPFSLinkToHttpsLink(iid));
    }

}

export let fileUploadService = new FileUploadService();
