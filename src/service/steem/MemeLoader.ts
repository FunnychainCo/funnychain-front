import {MemeLinkInterface, MemeLoaderInterface} from "../generic/ApplicationInterface";
import * as dsteem from "dsteem";
import {convertMeme, getAuthorAndPermalink} from "./generic/SteemUtils";
import {steemConnectAuthService} from "./steemConnect/SteemConnectAuthService";
import * as EventEmitter from "eventemitter3";
import * as Q from "q";
import {Meme, MEME_ENTRY_NO_VALUE, MEME_TYPE_FRESH, MEME_TYPE_HOT, MEME_TYPE_TRENDING} from "../generic/Meme";
import {MemeLink} from "./MemeLink";

export class MemeLoader implements MemeLoaderInterface {
    lastPostUrl: string = "";
    readonly EVENT_ON_MEME = "onMeme";
    eventEmitter = new EventEmitter();
    type: string;
    tags: string[];
    orderNumber: number = -1;
    private dSteemClient: dsteem.Client;

    //order can be negative

    constructor(type: string, tags: string[]) {
        this.dSteemClient = steemConnectAuthService.dSteemClient;
        this.type = type;
        this.tags = tags;
    }

    onMemeData(callback: (meme: MemeLinkInterface) => void): () => void {
        return ()=>{};
    }

    onMemeOrder(callback: (memesId: string[]) => void): () => void {
        return ()=>{};
    }

//id is url
    on(callback: (memes: MemeLinkInterface[]) => void): () => void {
        //https://www.npmjs.com/package/steem
        //https://jsfiddle.net/bonustrack/84dmnoLj/3/
        //https://github.com/Stormrose/steem-js/blob/444decdd182a136d066c0e0fd9ac81be974bdc88/doc/README.md
        //https://steemit.com/steemjs/@morning/steem-api-guide-how-to-get-recent-posts-getdiscussionsbycreated-load-more-and-pagination

        this.eventEmitter.on(this.EVENT_ON_MEME, callback);
        return () => {
            this.eventEmitter.off(this.EVENT_ON_MEME, callback);
        };
    }


    loadMoreRec(limit: number, totalLoaded: number, actuallyLoaded: number) {
        totalLoaded += actuallyLoaded;
        if (limit - totalLoaded > 0)
            this.loadMoreInternal(limit - totalLoaded).then((actuallyLoaded) => {
                this.loadMoreRec(limit, totalLoaded, actuallyLoaded)
            });
    }

    loadMore(limit: number): void {
        let totalLoaded = 0;
        this.loadMoreRec(limit, totalLoaded, 0);
    }

    loadMoreInternal(limit: number): Promise<number> {
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
            if (this.type == MEME_TYPE_HOT) {
                type = "trending";
            } else if (this.type == MEME_TYPE_TRENDING) {
                type = "hot";
            } else if (this.type == MEME_TYPE_FRESH) {
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
                    let promise = convertMeme(steemPost);
                    memesPromise.push(promise);
                });
                Q.all(memesPromise).then(memesData => {
                    memesData = memesData.filter((value:Meme) => {
                        return value != MEME_ENTRY_NO_VALUE;//remove invalid meme
                    });
                    let memeLinkData:MemeLinkInterface[] = [];
                    memesData.forEach((value:Meme) => {
                        let memeLink = new MemeLink(value.id);
                        memeLink.setMeme(value);
                        memeLinkData.push(memeLink);
                    });
                    this.eventEmitter.emit(this.EVENT_ON_MEME, memeLinkData);
                    resolve(memesData.length);
                });
            });

        });
    }

    refresh() {
    }

}