import {CommentServiceInterface, CommentsVisitor} from "../generic/ApplicationInterface";
import {MemeComment} from "../generic/MemeComment";
import {DATABASE_COMMENTS, FirebaseComment} from "./shared/FireBaseDBDefinition";
import * as firebase from "firebase";
import {userService} from "../generic/UserService";
import {audit} from "../Audit";
import axios from 'axios'
import {GLOBAL_PROPERTIES} from "../../properties/properties";

export class FirebaseCommentService implements CommentServiceInterface{
    getCommentVisitor(id): CommentsVisitor {
        return new FireBaseCommentVisitor(id);
    }

    getCommentNumber(memeId: string): Promise<number> {
        return new Promise<number>(resolve => {
            firebase.database().ref(DATABASE_COMMENTS + "/" + memeId + "/count").once("value", (data) => {
                let value: number = data.val();
                if(value==null){
                    //no comment in the database so no count entry
                    resolve(0);
                }else {
                    resolve(value);
                }
            }).catch(reason => {
                audit.reportError(reason);
                resolve(0);
            });
        });
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

export class FireBaseCommentVisitor implements CommentsVisitor{
    constructor(private memeId:string){

    }

    on(callback: (comments: MemeComment[]) => void): () => void {
        let toremove:any = firebase.database().ref(DATABASE_COMMENTS + '/' + this.memeId).on("child_added",(comments) => {
            if (comments == null) {
                audit.reportError(comments);
                return;
            }
            //let commentsValue:{[id:string] : FirebaseComment;} = comments.val();
            if(comments.key==="count"){
                return;
            }
            let commentsValue:FirebaseComment = comments.val();
            if (commentsValue == null) {
                callback([]);
                return;
            }
            userService.loadUserData(commentsValue.uid).then(userValue =>{
                callback([{
                    id: ""+commentsValue.date,
                    date : new Date(commentsValue.date),
                    parentId: this.memeId,
                    author: userValue,
                    text: commentsValue.message,
                    flagged: false
                }]);
            });
        });
        callback([]);
        //return remove listener function
        return () => {
            firebase.database().ref(DATABASE_COMMENTS + '/' + this.memeId).off("value", toremove);
        };
    }

    refresh(): Promise<string> {
        return Promise.resolve("not implemented");
    }

    loadMore(limit: number) {
    }

}

export let firebaseCommentService = new FirebaseCommentService();
