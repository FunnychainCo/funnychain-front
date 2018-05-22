import {Meme, MemeLoaderInterface, MemeServiceInterface} from "../generic/ApplicationInterface";
import steem from 'steem';
import * as Q from "q";
import {SteemPost, SteemVote} from "./SteemType";
import {getAuthorAndPermalink, loadUserAvatar} from "./SteemUtils";
import {steemAuthService} from "./SteemAuthService";
import * as EventEmitter from "eventemitter3";

export class SteemMemeService implements MemeServiceInterface {
    getMemeLoader(type: string, tags: string[]): MemeLoaderInterface {
        return new MemeLoader(type, tags);
    }

    post(title: string, body: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            console.log(title + " => " + body);
            resolve("ok");
        });
    }

    vote(url: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let voter = steemAuthService.currentUser.uid;
            let authorAndPermalink = getAuthorAndPermalink(url);
            steemAuthService.sc2Api.vote(voter, authorAndPermalink.author, authorAndPermalink.permalink, 10000,
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

class MemeLoader implements MemeLoaderInterface {
    lastPostUrl: string = "";
    eventEmitter = new EventEmitter();
    type: string;
    tags: string[];
    orderNumber: number = -1;//order can be negative

    constructor(type: string, tags: string[]) {
        this.type = type;
        this.tags = tags;
    }

//id is url
    on(callback: (memes: Meme[]) => void): () => void {
        //https://www.npmjs.com/package/steem
        //https://jsfiddle.net/bonustrack/84dmnoLj/3/
        //https://github.com/Stormrose/steem-js/blob/444decdd182a136d066c0e0fd9ac81be974bdc88/doc/README.md
        //https://steemit.com/steemjs/@morning/steem-api-guide-how-to-get-recent-posts-getdiscussionsbycreated-load-more-and-pagination

        this.eventEmitter.on("onMeme", callback);
        return () => {
            this.eventEmitter.off("onMeme", callback);
        };
    }

    loadMore(limit: number) {
        let memesPromise: Promise<Meme>[] = [];
        let params: any = {
            tag: this.tags[0], //TODO manage multiple tags
            limit: limit
        };
        if (this.lastPostUrl != "") {
            let authorAndPermalink = getAuthorAndPermalink(this.lastPostUrl);
            params.start_author = authorAndPermalink.author;
            params.start_permlink = authorAndPermalink.permalink;
            params.limit++;//for the skiped redundent post
        }
        steem.api.getDiscussionsByTrending(params, (err, result: SteemPost[]) => {
            result.forEach((steemPost: SteemPost, index, array) => {
                if (this.lastPostUrl != "" && index == 0) {
                    //skip redundent post
                    return;
                }
                this.orderNumber++;
                if (index == array.length - 1) {
                    //update cursor for next loadmore
                    this.lastPostUrl = steemPost.url;
                }
                if (Number(steem.formatter.reputation(steemPost.author_reputation)) < 15) {
                    return;
                }
                memesPromise.push(new Promise<Meme>((resolve, reject) => {
                    loadUserAvatar(steemPost.author).then((avatarUrl => {
                        let currentUserVoted = false;
                        let currentUser = steemAuthService.currentUser.uid;
                        steemPost.active_votes.forEach((vote: SteemVote) => {
                            if (vote.voter === currentUser) {
                                currentUserVoted = true;
                            }
                        });
                        //json_metadata:"{"tags":["dmania","meme","funny","punchline","lol"],"image":["https://s3-eu-west-1.amazonaws.com/dmania-images/machine-learning-f4p3k2i.jpg"],"app":"dmania/0.7"}"
                        let jsonMetadata: {
                            tags: string[],
                            image: string[],
                            app: string[]
                        } = JSON.parse(steemPost.json_metadata);
                        let newMeme: Meme = {
                            id: steemPost.url,
                            created: new Date(steemPost.created),
                            title: steemPost.title,
                            imageUrl: jsonMetadata.image[0],
                            commentNumber: steemPost.children,
                            voteNumber: steemPost.net_votes,
                            dolarValue: Number(steemPost.pending_payout_value.replace(" SBD", "")),
                            user: {
                                uid: steemPost.author,
                                displayName: steemPost.author,
                                avatarUrl: avatarUrl
                            },
                            currentUserVoted: currentUserVoted,
                            order: this.orderNumber
                        };
                        resolve(newMeme);
                    }));
                }));
            });
            Q.all(memesPromise).then(memesData => {
                this.eventEmitter.emit("onMeme", memesData);
            });
        });
    }

    refresh() {
    }

}

export let steemMemeService = new SteemMemeService();
