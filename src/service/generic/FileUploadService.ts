import {FileUploadServiceInterface, UploadedDataInterface} from "../generic/ApplicationInterface";
import {ipfsFileUploadService} from "../IPFSFileUploader/IPFSFileUploadService";
//import {firebaseUploadService} from "../firebase/FirebaseUploadService";

export class FileUploadService implements FileUploadServiceInterface{
    storageBase = "images"

    uploadFile(file:File,progress:(progressPercent:number)=>void):Promise<UploadedDataInterface> {
        //firebase need to be firebase auth
        //return firebaseUploadService.uploadFile(file);
        return ipfsFileUploadService.uploadFile(file,progress);
    }

    getMediaUrlFromImageID(iid:string):Promise<string>{
        /*if(iid.startsWith("0")){
            //media service image
        }*/
        return Promise.resolve(ipfsFileUploadService.convertIPFSHashToIPFSLink(iid));
    }

}

export let fileUploadService = new FileUploadService();
