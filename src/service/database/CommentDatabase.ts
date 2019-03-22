import {CommentDBEntry, DATABASE_CACHE_COMMENTS, DATABASE_COMMENTS} from "../database/shared/DBDefinition";
import * as firebase from "firebase";
import {audit} from "../log/Audit";

export class CommentDatabase{

    getCommentNumber(memeId: string): Promise<number> {
        return new Promise<number>(resolve => {
            firebase.database().ref(DATABASE_CACHE_COMMENTS + "/" + memeId + "/count").once("value", (data) => {
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

    on(memeId:string,callback: (comments: CommentDBEntry) => void): () => void {
        let event = "child_added";
        let toremove:any = firebase.database().ref(DATABASE_COMMENTS + '/' + memeId).on(event,(comments) => {
            if (comments == null) {
                audit.reportError(comments);
                return;
            }
            //let commentsValue:{[id:string] : CommentDBEntry;} = comments.val();
            if(comments.key==="count"){
                return;
            }
            let commentsValue:CommentDBEntry = comments.val();
            if (commentsValue == null) {
                return;
            }
            callback(commentsValue);
        });

        //return remove listener function
        return () => {
            firebase.database().ref(DATABASE_COMMENTS + '/' + memeId).off(event, toremove);
        };
    }

}

export let commentDatabase = new CommentDatabase();
