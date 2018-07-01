import {CommentServiceInterface, CommentsVisitor, MemeComment} from "../generic/ApplicationInterface";
import * as dsteem from 'dsteem';
import * as EventEmitter from "eventemitter3";
import * as Q from "q";
import {getAuthorAndPermalink, loadUserAvatar, markdownImageLink} from "./SteemUtils";
import {steemAuthService} from "./SteemAuthService";
import {PROVIDER_STEEM} from "../generic/UserEntry";

export class SteemCommentService implements CommentServiceInterface {

    getCommentVisitor(id): CommentsVisitor {
        return new SteemCommentsVisitor(id);
    }
}

export class SteemCommentsVisitor implements CommentsVisitor {
    emitter = new EventEmitter();
    id: string;
    author: string;
    permalink: string;
    private dSteemClient: dsteem.Client;
    private lastCommentIndex: number=0;
    //TODO improve this system use limit in steem API
    allDataLoaded: boolean = false;
    allComments:MemeComment[] = [];

    constructor(id) {
        this.dSteemClient = new dsteem.Client('https://api.steemit.com');
        this.id = id;
        let authorAndPermalink = getAuthorAndPermalink(id);
        this.author = authorAndPermalink.author;
        this.permalink = authorAndPermalink.permalink;
    }

    postComment(parentPostId: string, message: string): Promise<String> {
        return new Promise<String>((resolve, reject) => {
            let authorAndPermalink = getAuthorAndPermalink(parentPostId);
            let parentAuthor = authorAndPermalink.author;
            let parentPermalink = authorAndPermalink.permalink;
            let owner = steemAuthService.currentUser.uid;
            //20180521t112532375z
            //re-marel-apartment-roomate-zg1hbmlh-hvk3j-20180521t112532375z
            //         apartment-roomate-zg1hbmlh-hvk3j
            let formatedDate = new Date().toISOString().replace(new RegExp("-", 'g'), "").replace(new RegExp(":", 'g'), "").replace("T", "t").replace("Z", "z").replace(".", "");
            let commentPermalink = "re-" + parentAuthor + "-" + parentPermalink + "-" + formatedDate;
            steemAuthService.sc2Api.comment(parentAuthor, parentPermalink, owner, commentPermalink, "", message, {},
                (err, res) => {
                    if (res != null) {
                        let comment: MemeComment = {
                            text: message,
                            author: steemAuthService.currentUser,
                            parentId: parentPostId,
                            id: commentPermalink,
                            flagged:false
                        };
                        this.emitter.emit("onNewComment" + this.id, [comment]);
                    } else {
                        console.error(err);
                        reject(err);
                    }
                });
        });
    }

    on(callback: (memes: MemeComment[]) => void): () => void {
        this.emitter.on("onNewComment" + this.id, callback);
        return () => {
            this.emitter.off("onNewComment" + this.id, callback);
        };
    }

    getAllComment():Promise<MemeComment[]>{
        if(this.allDataLoaded){
            return new Promise<MemeComment[]>(resolve => {
                resolve(this.allComments);
            })
        }else {
            return new Promise<MemeComment[]>(resolve => {
                let memesComments: Promise<MemeComment>[] = [];
                this.dSteemClient.database.call('get_content_replies', [this.author, this.permalink]).then(results => {
                    ///dmania/@sanmi/the-real-meaning-of-followerspeople-still-celebratei-feel-we-need-an-auto-unfollow-mechanism-zg1hbmlh-9omhu
                    results.forEach((comment: any) => {
                        memesComments.push(new Promise<MemeComment>((resolve, reject) => {
                            loadUserAvatar(comment.author).then((avatarUrl => {
                                //let flagged = comment.author_reputation < 15; //TODO reactivate that
                                let flagged = false;
                                let memeComment: MemeComment = {
                                    author: {
                                        uid: comment.author,
                                        provider:PROVIDER_STEEM,
                                        email:"",
                                        displayName: comment.author,
                                        avatarUrl: avatarUrl
                                    },
                                    id: comment.url,
                                    parentId: this.id,
                                    text: markdownImageLink(comment.body),
                                    flagged: flagged
                                };
                                resolve(memeComment);
                            }));
                        }));
                    });
                    Q.all(memesComments).then(comments => {
                        this.allComments=comments;
                        this.allDataLoaded = true;
                        resolve(this.allComments);
                    });
                });
            });
        }
    }

    loadMore(limit: number) {
        this.getAllComment().then(comments => {
            let memeComments = comments.slice(this.lastCommentIndex,this.lastCommentIndex+limit);
            this.lastCommentIndex+=limit;
            this.emitter.emit("onNewComment" + this.id, memeComments);
        });
    }
}

export let steemCommentService = new SteemCommentService();
