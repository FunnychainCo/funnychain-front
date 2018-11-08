import {CommentsAction, MemeServiceAction, UploadedDataInterface} from "../generic/ApplicationInterface";
import * as firebase from "firebase";
import {ipfsFileUploadService} from "../IPFSFileUploader/IPFSFileUploadService";
import {IPFSMeme} from "../generic/Meme";
import {UserEntry} from "../generic/UserEntry";
import {firebaseUpvoteService} from "./FirebaseUpvoteService";
import {DATABASE_MEMES, FirebaseMeme} from "./shared/FireBaseDBDefinition";
import {firebaseBetService} from "./FirebaseBetService";
import {firebaseCommentService} from "./FirebaseCommentService";
import {audit} from "../Audit";

export class FirebaseActionService implements MemeServiceAction, CommentsAction {
    vote(memeID: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let currentUser = firebase.auth().currentUser;
            if(currentUser==null){
                reject("error");
            }else {
                let uid = currentUser.uid;
                firebaseUpvoteService.vote(memeID,uid).then(value => {
                    audit.track("user/vote",{
                        uid:uid
                    });
                });
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
                firebaseBetService.bet(memeID,uid).then(value => {
                    audit.track("user/bet",{
                        value:1,
                        uid:uid
                    });
                });
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
            ipfsFileUploadService.uploadBuffer(
                Buffer.from(JSON.stringify(iPFSMeme)),
                progressPercent => {
                    console.warn(progressPercent);
                }
            ).then((value: UploadedDataInterface) => {
                let currentUser = firebase.auth().currentUser;
                if (currentUser == null) {
                    console.error(currentUser);
                    return;
                }
                let userUID = currentUser.uid;
                let meme:FirebaseMeme = {
                    memeIpfsHash: value.fileId,
                    uid: userUID,
                    created: new Date().getTime(),
                    value:0,
                    hot:0
                };
                firebase.database().ref(DATABASE_MEMES + '/' + value.fileId).set(meme).then(()=>{
                    audit.track("user/post/meme",{
                        uid:userUID
                    });
                    resolve("ok");
                });
            });
        });
    }

    postComment(memeId: string, message: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let currentUser = firebase.auth().currentUser;
            if(currentUser==null){
                reject("error");
            }else {
                let uid = currentUser.uid;
                firebaseCommentService.postComment(memeId,message,uid).then(value => {
                    audit.track("user/post/comment",{
                        uid:uid
                    });
                });
            }
        });
    }

    start(userDataReceived: UserEntry) {

    }
}

export let firebaseActionService = new FirebaseActionService();

