import {CommentServiceInterface, CommentsVisitor} from "../generic/ApplicationInterface";
import {DATABASE_COMMENTS} from "../database/shared/DBDefinition";
import axios from 'axios'
import {GLOBAL_PROPERTIES} from "../../properties/properties";
import {FireBaseCommentVisitor} from "./FireBaseCommentVisitor";
import {commentDatabase} from "../database/CommentDatabase";

export class FirebaseCommentService implements CommentServiceInterface{
    getCommentVisitor(id): CommentsVisitor {
        return new FireBaseCommentVisitor(id);
    }

    getCommentNumber(memeId: string): Promise<number> {
        return commentDatabase.getCommentNumber(memeId);
    }

    postComment(memeId: string, message: string,uid:string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            axios.post(GLOBAL_PROPERTIES.COMMENTS_SERVICE_POST(), {
                memeId:memeId,
                message:message,
                uid:uid,
            }).then((response) => {
                resolve("ok");
            }).catch(reason => {
                reject(reason);
            });
        });
    }

    storageBase = DATABASE_COMMENTS;

}

export let firebaseCommentService = new FirebaseCommentService();
