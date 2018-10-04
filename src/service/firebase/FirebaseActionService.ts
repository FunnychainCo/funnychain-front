import {CommentsAction, MemeServiceAction, UploadedDataInterface} from "../generic/ApplicationInterface";
import * as firebase from "firebase";
import {ipfsFileUploadService} from "../IPFSFileUploader/IPFSFileUploadService";
import {IPFSMeme} from "../generic/Meme";
import {UserEntry} from "../generic/UserEntry";
import {firebaseUpvoteService} from "./FirebaseUpvoteService";
import {DATABASE_MEMES, FirebaseMeme} from "./shared/FireBaseDBDefinition";
import {firebaseBetService} from "./FirebaseBetService";

export class FirebaseActionService implements MemeServiceAction, CommentsAction {
    vote(memeID: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let currentUser = firebase.auth().currentUser;
            if(currentUser==null){
                reject("error");
            }else {
                let uid = currentUser.uid;
                firebaseUpvoteService.vote(memeID,uid);
            }
        });
    }

    bet(memeID: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let currentUser = firebase.auth().currentUser;
            if(currentUser==null){
                reject("error");
            }else {
                let uid = currentUser.uid;
                firebaseBetService.bet(memeID,uid);
            }
        });
    }

    post(title: string, url: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let ipfsImageHash = ipfsFileUploadService.convertIPFSLinkToIPFSHash(url);
            let iPFSMeme: IPFSMeme = {
                title: title,
                imageIPFSHash: ipfsImageHash
            };
            ipfsFileUploadService.uploadBuffer(Buffer.from(JSON.stringify(iPFSMeme))).then((value: UploadedDataInterface) => {
                let currentUser = firebase.auth().currentUser;
                if (currentUser == null) {
                    console.error(currentUser);
                    return;
                }
                let meme:FirebaseMeme = {
                    memeIpfsHash: value.fileId,
                    uid: currentUser.uid,
                    created: new Date().getTime()
                };
                firebase.database().ref(DATABASE_MEMES + '/' + value.fileId).set(meme).then(()=>{
                    resolve("ok");
                });
            });
        });
    }

    postComment(parentPostId: string, message: string): Promise<string> {
        throw new Error();
    }

    start(userDataReceived: UserEntry) {

    }
}

export let firebaseActionService = new FirebaseActionService();

