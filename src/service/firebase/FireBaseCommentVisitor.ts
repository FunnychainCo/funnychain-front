import {CommentsVisitor} from "../generic/ApplicationInterface";
import {MemeComment} from "../generic/MemeComment";
import {userService} from "../generic/UserService";
import {commentDatabase} from "../database/CommentDatabase";
import {report} from "../log/Report";
import {UserEntry} from "../generic/UserEntry";

export class FireBaseCommentVisitor implements CommentsVisitor{
    constructor(private memeId:string){

    }

    on(callback: (comments: MemeComment[]) => void): () => void {
        let remove:()=>void = commentDatabase.on(this.memeId,commentsValue => {
            userService.loadUserData(commentsValue.uid).then((userValue:UserEntry) =>{
                let localReportContent:boolean = !!report.getReportedContent("comment")[commentsValue.uid]
                let localReportUser:boolean = !!report.getReportedContent("user")[userValue.uid];
                let distantReportContent = commentsValue.flag?commentsValue.flag:false;
                let distantReportUser = userValue.flag?userValue.flag:false;
                if(!localReportContent&&!localReportUser&&!distantReportContent&&!distantReportUser) {
                    callback([{
                        id: "" + commentsValue.date,
                        date: new Date(commentsValue.date),
                        parentId: this.memeId,
                        author: userValue,
                        text: commentsValue.message,
                        flagged: false
                    }]);
                }
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