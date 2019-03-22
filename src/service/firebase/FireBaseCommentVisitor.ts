import {CommentsVisitor} from "../generic/ApplicationInterface";
import {MemeComment} from "../generic/MemeComment";
import {userService} from "../generic/UserService";
import {commentDatabase} from "../database/CommentDatabase";

export class FireBaseCommentVisitor implements CommentsVisitor{
    constructor(private memeId:string){

    }

    on(callback: (comments: MemeComment[]) => void): () => void {
        let remove:()=>void = commentDatabase.on(this.memeId,commentsValue => {
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
            remove();
        };
    }

    refresh(): Promise<string> {
        return Promise.resolve("not implemented");
    }

    loadMore(limit: number) {
    }

}