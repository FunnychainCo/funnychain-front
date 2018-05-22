import {CommentServiceInterface, CommentsVisitor, MemeComment} from "../generic/ApplicationInterface";
import steem from 'steem';
import * as EventEmitter from "eventemitter3";
import * as Q from "q";
import {SteemReplies} from "./SteemType";
import {getAuthorAndPermalink, loadUserAvatar, markdownImageLink} from "./SteemUtils";
import {steemAuthService} from "./SteemAuthService";

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
    allDataLoaded: boolean = false;

    constructor(id) {
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
                            id: commentPermalink
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

    loadMore(limit: number) {
        if (this.allDataLoaded == true) {
            return;
        }
        let memesComments: Promise<MemeComment>[] = [];
        //steem.api.getRepliesByLastUpdate(this.author, this.permalink, limit, (err, results: SteemReplies[]) => {
        steem.api.getContentReplies(this.author, this.permalink, (err, results: SteemReplies[]) => {
            ///dmania/@sanmi/the-real-meaning-of-followerspeople-still-celebratei-feel-we-need-an-auto-unfollow-mechanism-zg1hbmlh-9omhu
            results.forEach((comment: SteemReplies) => {
                if (Number(steem.formatter.reputation(comment.author_reputation)) < 15) {
                    return;
                }
                memesComments.push(new Promise<MemeComment>((resolve, reject) => {

                    loadUserAvatar(comment.author).then((avatarUrl => {
                        let memeComment: MemeComment = {
                            author: {
                                uid: comment.author,
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
                this.allDataLoaded = true;
                this.emitter.emit("onNewComment" + this.id, comments);
            });
        });
    }
}

export let steemCommentService = new SteemCommentService();
