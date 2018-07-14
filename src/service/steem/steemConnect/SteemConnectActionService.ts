import {CommentsAction, MemeServiceAction} from "../../generic/ApplicationInterface";
import {constructMemeComment, constructMemePost} from "../generic/PostsMaker";
import {getAuthorAndPermalink} from "../generic/SteemUtils";
import {steemConnectAuthService} from "./SteemConnectAuthService";

export class SteemConnectActionService implements MemeServiceAction, CommentsAction {

    start() {
    }

    postComment(parentPostId: string, message: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let owner = steemConnectAuthService.currentUser.uid;
            let memeCommentJson = constructMemeComment(owner,parentPostId, message,{});
            steemConnectAuthService.sc2Api.comment(
                memeCommentJson.parentAuthor,
                memeCommentJson.parentPermalink,
                memeCommentJson.owner,
                memeCommentJson.commentPermalink,
                memeCommentJson.title,
                memeCommentJson.message,
                memeCommentJson.jsonMetadata,
                (err, res) => {
                    if (res != null) {
                        resolve("ok");
                    } else {
                        console.error(err);
                        reject(err);
                    }
                });
        });
    }


    post(title: string, url: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let owner = steemConnectAuthService.currentUser.uid;
            let memePostJson = constructMemePost(owner,title, url, {});
            steemConnectAuthService.sc2Api.comment(memePostJson.parentAuthor, memePostJson.parentPermalink, memePostJson.owner, memePostJson.commentPermalink, memePostJson.title, memePostJson.message, memePostJson.jsonMetadata,
                (err, res) => {
                    if (res != null) {
                        console.log("message posted", res);
                        resolve("ok");
                    } else {
                        console.error(err);
                        reject(err);
                    }
                });
            resolve("ok");
        });
    }

    vote(url: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let voter = steemConnectAuthService.currentUser.uid;
            let authorAndPermalink = getAuthorAndPermalink(url);
            steemConnectAuthService.sc2Api.vote(voter, authorAndPermalink.author, authorAndPermalink.permalink, 10000,
                (err, res) => {
                    if (res != null) {
                        resolve("ok");
                    } else {
                        console.error(err);
                        reject(err);
                    }
                });
        });
    }

}

export let steemConnectActionService = new SteemConnectActionService();

