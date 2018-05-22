import {FileUploadServiceInterface, UploadedDataInterface} from "../generic/ApplicationInterface";
//import {firebaseUploadService} from "../firebase/FirebaseUploadService";

export class FileUploadService implements FileUploadServiceInterface{
    storageBase = "images"

    uploadFile(file:File):Promise<UploadedDataInterface> {
        //firebase need to be firebase auth
        //return firebaseUploadService.uploadFile(file);
        return new Promise<UploadedDataInterface>((resolve, reject) => {
            console.error("fileupload not implemented");
            resolve({
                fileId:"https://avatar.admin.rphstudio.net/avatar/avatars/avatar-061.jpeg",
                fileURL:"https://avatar.admin.rphstudio.net/avatar/avatars/avatar-061.jpeg"
            });
        })
    }

}

export let fileUploadService = new FileUploadService();
