import {FileUploadServiceInterface, UploadedDataInterface} from "../generic/ApplicationInterface";
import {ipfsFileUploadService} from "../IPFSFileUploader/IPFSFileUploadService";
//import {firebaseUploadService} from "../firebase/FirebaseUploadService";

export class FileUploadService implements FileUploadServiceInterface{
    storageBase = "images"

    uploadFile(file:File):Promise<UploadedDataInterface> {
        //firebase need to be firebase auth
        //return firebaseUploadService.uploadFile(file);
        return ipfsFileUploadService.uploadFile(file);
    }

}

export let fileUploadService = new FileUploadService();
