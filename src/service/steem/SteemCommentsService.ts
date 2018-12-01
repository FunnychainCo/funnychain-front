import {CommentServiceInterface, CommentsVisitor} from "../generic/ApplicationInterface";
import * as dsteem from 'dsteem';
import * as EventEmitter from "eventemitter3";
import * as Q from "q";
import {
    getAuthorAndPermalink,
    getAvatarURLFromSteemUserAccount,
    markdownImageLink,
    preloadImageWithFallBackURL
} from "./generic/SteemUtils";
import {PROVIDER_STEEM} from "../generic/UserEntry";
import {MEME_COMMENT_NO_VALUE, MemeComment} from "../generic/MemeComment";
import {audit} from "../Audit";

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
    private lastCommentIndex: number = 0;
    //TODO improve this system use limit in steem API
    allDataLoaded: boolean = false;
    allComments: MemeComment[] = [];

    constructor(id) {
        this.dSteemClient = new dsteem.Client('https://api.steemit.com');
        this.id = id;
        let authorAndPermalink = getAuthorAndPermalink(id);
        this.author = authorAndPermalink.author;
        this.permalink = authorAndPermalink.permalink;
    }

    on(callback: (memes: MemeComment[]) => void): () => void {
        this.emitter.on("onNewComment" + this.id, callback);
        return () => {
            this.emitter.off("onNewComment" + this.id, callback);
        };
    }

    refresh():Promise<string>{
        return new Promise<string>(resolve => {
            this.loadComments().then((comments)=>{
                let commentsMap = {};
                this.allComments.forEach(comment => {
                    commentsMap[comment.id] = comment;
                });
                comments.forEach(comment => {
                    if(commentsMap[comment.id]==undefined){
                        //new comment update the table
                        this.allComments.push(comment);
                        this.emitter.emit("onNewComment" + this.id, [comment]);
                    }
                });
            });
        });
    }

    loadComments(): Promise<MemeComment[]>{
        return new Promise<MemeComment[]>(resolve => {
            let memesComments: Promise<MemeComment>[] = [];
            //https://jnordberg.github.io/dsteem/
            this.dSteemClient.database.call('get_content_replies', [this.author, this.permalink]).then((results:dsteem.Discussion[]) => {
                ///dmania/@sanmi/the-real-meaning-of-followerspeople-still-celebratei-feel-we-need-an-auto-unfollow-mechanism-zg1hbmlh-9omhu
                results.forEach((comment: dsteem.Discussion) => {
                    memesComments.push(new Promise<MemeComment>((resolve) => {
                        let avatarURL = getAvatarURLFromSteemUserAccount(comment.author);
                        try {
                            if(comment.json_metadata!=="") {
                                let jsonMetaData: any = JSON.parse(comment.json_metadata);
                                if (jsonMetaData.delegatedOwner !== undefined) {
                                    comment.author = jsonMetaData.delegatedOwner.name;
                                    avatarURL = jsonMetaData.delegatedOwner.url;
                                }
                            }
                        }catch (e) {
                            audit.reportError(e);
                            //continue
                        }
                        preloadImageWithFallBackURL(avatarURL).then((avatarUrl => {
                            //let flagged = comment.author_reputation < 15; //TODO reactivate that
                            let flagged = false;
                            let memeComment: MemeComment = {
                                author: {
                                    uid: comment.author,
                                    provider: PROVIDER_STEEM,
                                    email: "",
                                    displayName: comment.author,
                                    avatarUrl: avatarUrl,
                                    wallet:0
                                },
                                date:new Date(0),
                                id: comment.url,
                                parentId: this.id,
                                text: markdownImageLink(comment.body),
                                flagged: flagged
                            };
                            resolve(memeComment);
                        })).catch(reason => {
                            audit.reportError(reason);
                            resolve(MEME_COMMENT_NO_VALUE);
                        });
                    }));
                });
                Q.all(memesComments).then(comments => {
                    comments = comments.filter((value:MemeComment) => {
                        return value != MEME_COMMENT_NO_VALUE;//remove invalid meme
                    });
                    resolve(comments);
                });
            });
        });
    }

    getAllComment(): Promise<MemeComment[]> {
        if (this.allDataLoaded) {
            return new Promise<MemeComment[]>(resolve => {
                resolve(this.allComments);
            })
        } else {
            return new Promise<MemeComment[]>(resolve => {
                this.loadComments().then((comments)=>{
                    this.allComments = comments;
                    this.allDataLoaded = true;
                    resolve(this.allComments);
                })
            });
        }
    }

    loadMore(limit: number) {
        this.getAllComment().then(comments => {
            let memeComments = comments.slice(this.lastCommentIndex, this.lastCommentIndex + limit);
            this.lastCommentIndex += limit;
            this.emitter.emit("onNewComment" + this.id, memeComments);
        });
    }
}

export let steemCommentService = new SteemCommentService();
