import {MemeLoaderInterface} from "../generic/ApplicationInterface";
import * as dsteem from "dsteem";
import {convertMeme, getAuthorAndPermalink} from "./SteemUtils";
import {steemAuthService} from "./SteemAuthService";
import * as EventEmitter from "eventemitter3";
import * as Q from "q";
import {Meme, MEME_ENTRY_NO_VALUE} from "../generic/Meme";

export class MemeLoader implements MemeLoaderInterface {
    lastPostUrl: string = "";
    eventEmitter = new EventEmitter();
    type: string;
    tags: string[];
    orderNumber: number = -1;
    private dSteemClient: dsteem.Client;

    //order can be negative

    constructor(type: string, tags: string[]) {
        this.dSteemClient = steemAuthService.dSteemClient;
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
            totalLoaded += actuallyLoaded;
            if (limit - totalLoaded > 0)
                this.loadMoreV1(limit - totalLoaded).then(actuallyLoaded => {
                    totalLoaded += actuallyLoaded;
                    if (limit - totalLoaded > 0)
                        this.loadMoreV1(limit - totalLoaded).then(actuallyLoaded => {
                            totalLoaded += actuallyLoaded;
                            if (limit - totalLoaded > 0)
                                this.loadMoreV1(limit - totalLoaded).then(actuallyLoaded => {
                                });
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
                    let promise = convertMeme(steemPost,this.orderNumber);
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