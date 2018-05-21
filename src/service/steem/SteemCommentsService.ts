import {CommentServiceInterface, CommentsVisitor, MemeComment} from "../generic/ApplicationInterface";
import steem from 'steem';
import * as EventEmitter from "eventemitter3";
import * as Q from "q";
import {SteemReplies} from "./SteemType";
import {loadUserAvatar, markdownImageLink} from "./SteemUtils";

export class SteemCommentService implements CommentServiceInterface{

    getCommentVisitor(id):CommentsVisitor{
        return new SteemCommentsVisitor(id);
    }
}

export class SteemCommentsVisitor implements CommentsVisitor{
    emitter = new EventEmitter();
    id:string;
    author:string;
    permalink:string;
    allDataLoaded:boolean=false;

    constructor(id) {
        this.id = id;
        let split = this.id.split("/");
        this.author = split[2];
        this.author = this.author.substr(1, this.author.length);//remove @
        this.permalink = split[3];
    }

    on(callback: (memes: MemeComment[]) => void): () => void {
        this.emitter.on("onNewComment"+this.id,callback);
        return () => {
            this.emitter.off("onNewComment"+this.id,callback);
        };
    }

    loadMore(limit:number){
        if(this.allDataLoaded==true){
            return;
        }
        let memesComments:Promise<MemeComment>[] = [];
        //steem.api.getRepliesByLastUpdate(this.author, this.permalink, limit, (err, results: SteemReplies[]) => {
        steem.api.getContentReplies(this.author, this.permalink, (err, results: SteemReplies[]) => {
            ///dmania/@sanmi/the-real-meaning-of-followerspeople-still-celebratei-feel-we-need-an-auto-unfollow-mechanism-zg1hbmlh-9omhu
            results.forEach((comment: SteemReplies) => {
                if(Number(steem.formatter.reputation(comment.author_reputation))<15){
                    return;
                }
                memesComments.push(new Promise<MemeComment>((resolve, reject) => {

                    loadUserAvatar(comment.author).then((avatarUrl => {
                        let memeComment: MemeComment = {
                            author: {
                                displayName: comment.author,
                                avatarUrl: avatarUrl
                            },
                            id: comment.url,
                            parentId: this.id,
                            text: markdownImageLink(comment.body)
                        };
                        resolve(memeComment);
                    }));
                }));
            });
            Q.all(memesComments).then(comments => {
                this.allDataLoaded=true;
                this.emitter.emit("onNewComment"+this.id,comments);
            });
        });
    }
}

export let steemCommentService = new SteemCommentService();
