import {CommentsAction, MemeServiceAction, UploadedDataInterface} from "../generic/ApplicationInterface";
import * as firebase from "firebase";
import {ipfsFileUploadService} from "../uploader/IPFSFileUploadService";
import {IPFSMeme} from "../generic/Meme";
import {UserEntry} from "../generic/UserEntry";
import {upvoteService} from "../generic/UpvoteService";
import {MemeDBEntry} from "../database/shared/DBDefinition";
import {firebaseBetService} from "./FirebaseBetService";
import {firebaseCommentService} from "./FirebaseCommentService";
import {audit} from "../log/Audit";
import {memeDatabase} from "../database/MemeDatabase";

export class FirebaseActionService implements MemeServiceAction, CommentsAction {
    vote(memeID: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let currentUser = firebase.auth().currentUser;
            if(currentUser==null){
                reject("error");
            }else {
                let uid = currentUser.uid;
                upvoteService.vote(memeID,uid).then(value => {
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
                    audit.reportError(currentUser);
                    return;
                }
                let userUID = currentUser.uid;
                let meme:MemeDBEntry = {
                    memeIpfsHash: value.fileId,
                    uid: userUID,
                    created: new Date().getTime(),
                    value:0,
                    hot:0
                };
                memeDatabase.postMeme(value.fileId,meme).then(() => {
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

