import {Meme, MEME_ENTRY_NO_VALUE, MemeLoaderInterface, MemeServiceInterface} from "../generic/ApplicationInterface";
import * as dsteem from 'dsteem';
import * as Q from "q";
import {SteemVote} from "./SteemType";
import {getAuthorAndPermalink, loadUserAvatar} from "./SteemUtils";
import {steemAuthService} from "./SteemAuthService";
import * as EventEmitter from "eventemitter3";
import {idService} from "../IdService";
import {memeService} from "../generic/MemeService";

export class SteemMemeService implements MemeServiceInterface {
    getMemeLoader(type: string, tags: string[]): MemeLoaderInterface {
        return new MemeLoader(type, tags);
    }

    replaceAll(target, search, replacement) {
        return target.replace(new RegExp(search, 'g'), replacement);
    };

    makePermalinkFromTitle(title: string): string {
        title = title.toLowerCase();
        title = this.replaceAll(title, " ", "-");
        title = this.replaceAll(title, "\t", "-");
        title = this.replaceAll(title, "\n", "-");
        title = this.replaceAll(title, "\r", "-");
        title = this.replaceAll(title, "\b", "-");
        title = this.replaceAll(title, "\f", "-");
        title = title.replace(/[^a-zA-Z]/, "");
        return title + idService.makeidAlpha(6).toLowerCase();
    }



    post(title: string, url: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            /**
             * If you want a post, than parentAuthor is an empty string and parentPermlink is your first tag. You might want to check out any post's jsonMetadata on steemd to see how to do that part.
             The doc also explains the login at the top of the page.
             */
            let tags: string[] = memeService.getTags();
            let parentAuthor = "";
            let parentPermalink = tags[0];
            let commentPermalink = this.makePermalinkFromTitle(title);
            let owner = steemAuthService.currentUser.uid;
            let urlSplit = url.split("/");
            let message = "![" + urlSplit[urlSplit.length - 1] + "](" + url + ")";
            let jsonMetadata = {
                tags: tags,
                app:"funnychain/0.1",
                image: [url],
                links: [url],
                format: "markdown"
            };
            //cat meme body is image markdown => //json_metadata:"{"tags":["meme","funny","tether","cryptocurrencies","dmania"],"image":["https://steemitimages.com/DQmQxfdrfb6ucJtmRDNCYvcf8d4QXq71dcVLmZQtT3JnD77/2ar6h6.jpg"],"app":"steemit/0.1","format":"markdown"}"
            //cat dmania body is html => // json_metadata:"{"tags":["dmania","meme","funny"],"image":["https://s3-eu-west-1.amazonaws.com/dmania-images/cyrmarket-0oh7nq4.jpg"],"app":"dmania/0.7"}"
            console.log("meme post =>" + parentAuthor + " => " + parentPermalink + " => " + commentPermalink + " => " + owner + " => " + message + " => ", jsonMetadata);
            steemAuthService.sc2Api.comment(parentAuthor, parentPermalink, owner, commentPermalink, title, message, jsonMetadata,
                (err, res) => {
                    if (res != null) {
                        console.log("message posted", res);
                        resolve("ok");
                    } else {
                        console.error(err);
                        reject(err);
                    }
                });
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
    orderNumber: number = -1;
    private dSteemClient: dsteem.Client;

    //order can be negative

    constructor(type: string, tags: string[]) {
        this.dSteemClient = new dsteem.Client('https://api.steemit.com');
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

    loadMore(limit: number): void {
        //TODO find a better way to do that
        let totalLoaded = 0;
        this.loadMoreV1(limit).then((actuallyLoaded: number) => {
            totalLoaded+=actuallyLoaded;
            if (limit - totalLoaded > 0)
                this.loadMoreV1(limit - totalLoaded).then(actuallyLoaded => {
                    totalLoaded+=actuallyLoaded;
                    if (limit - totalLoaded > 0)
                        this.loadMoreV1(limit - totalLoaded).then(actuallyLoaded => {
                            totalLoaded+=actuallyLoaded;
                            if (limit - totalLoaded > 0)
                                this.loadMoreV1(limit - totalLoaded).then(actuallyLoaded => {});
                        });
                });
        });
    }

    loadMoreV1(limit: number): Promise<number> {
        return new Promise(resolve => {
            let memesPromise: Promise<Meme>[] = [];
            let params: dsteem.DisqussionQuery = {
                tag: this.tags[0], //TODO manage multiple tags
                limit: limit
            };
            if (this.lastPostUrl != "") {
                let authorAndPermalink = getAuthorAndPermalink(this.lastPostUrl);
                params.start_author = authorAndPermalink.author;
                params.start_permlink = authorAndPermalink.permalink;
                params.limit++;//for the skiped redundent post
            }
            let type: dsteem.DiscussionQueryCategory = "trending";
            if (this.type == "hot") {
                type = "trending";
            } else if (this.type == "trending") {
                type = "hot";
            } else if (this.type == "fresh") {
                type = "created";
            } else {
                console.error("unkown type");
            }
            this.dSteemClient.database.getDiscussions(type, params).then((result: dsteem.Discussion[]) => {
                if (result == undefined) {
                    console.error(result);
                    return;
                }
                result.forEach((steemPost: dsteem.Discussion, index, array) => {
                    if (this.lastPostUrl != "" && index == 0) {
                        //skip redundent post
                        return;
                    }
                    this.orderNumber++;
                    //update cursor for next loadmore
                    if (index == array.length - 1) {
                        this.lastPostUrl = steemPost.url;
                    }
                    //filter ost with author with bad reputation
                    /*if (steemPost.author_reputation < 15) {
                        return;
                    }*/
                    //create a promise and load
                    let promise = new Promise<Meme>((resolve, reject) => {
                        loadUserAvatar(steemPost.author)
                            .then((avatarUrl => {
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
                                    links: string[],
                                    app: string
                                } = JSON.parse(steemPost.json_metadata);
                                //check json format
                                if (jsonMetadata.image == undefined) {
                                    resolve(MEME_ENTRY_NO_VALUE);//resolve for q.all to work
                                    return;
                                }
                                if (jsonMetadata.image.length != 1) {
                                    resolve(MEME_ENTRY_NO_VALUE);//resolve for q.all to work
                                    return;
                                }
                                let newMeme: Meme = {
                                    id: steemPost.url,
                                    created: new Date(steemPost.created),
                                    title: steemPost.title,
                                    imageUrl: jsonMetadata.image[0],
                                    commentNumber: steemPost.children,
                                    voteNumber: steemPost.net_votes,
                                    dolarValue: Number(steemPost.pending_payout_value.toString().replace(" SBD", "")),
                                    user: {
                                        uid: steemPost.author,
                                        displayName: steemPost.author,
                                        avatarUrl: avatarUrl
                                    },
                                    currentUserVoted: currentUserVoted,
                                    order: this.orderNumber
                                };
                                resolve(newMeme);
                            }))
                            .catch(reason => {
                                resolve(MEME_ENTRY_NO_VALUE);//resolve for q.all to work
                                console.error(reason);
                            });
                    });
                    promise.catch(reason => {
                        console.error(reason);
                    });
                    memesPromise.push(promise);
                });
                Q.all(memesPromise).then(memesData => {
                    memesData = memesData.filter(value => {
                        return value != MEME_ENTRY_NO_VALUE;//remove invalid meme
                    });
                    this.eventEmitter.emit("onMeme", memesData);
                    resolve(memesData.length);
                });
            });

        });
    }

    refresh() {
    }

}

export let steemMemeService = new SteemMemeService();
