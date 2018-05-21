import {Meme, MemeServiceInterface} from "../generic/ApplicationInterface";
import steem from 'steem';
import * as Q from "q";
import {SteemPost} from "./SteemType";
import {loadUserAvatar} from "./SteemUtils";

export class SteemBaseMemeService implements MemeServiceInterface {
    //id is url
    on(callback: (memes: Meme[]) => void): () => void {
        let memesPromise:Promise<Meme>[] = [];
        //https://www.npmjs.com/package/steem
        //https://jsfiddle.net/bonustrack/84dmnoLj/3/
        //https://github.com/Stormrose/steem-js/blob/444decdd182a136d066c0e0fd9ac81be974bdc88/doc/README.md
        //https://steemit.com/steemjs/@morning/steem-api-guide-how-to-get-recent-posts-getdiscussionsbycreated-load-more-and-pagination
        steem.api.getDiscussionsByTrending({"tag": "dmania", "limit": 10}, (err, result: SteemPost[]) => {
            result.forEach((steemPost: SteemPost) => {
                if(Number(steem.formatter.reputation(steemPost.author_reputation))<15){
                    return;
                }
                memesPromise.push(new Promise<Meme>((resolve, reject) => {
                    loadUserAvatar(steemPost.author).then((avatarUrl => {
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
                                displayName: steemPost.author,
                                avatarUrl: avatarUrl
                            }
                        };
                        resolve(newMeme);
                    }));
                }));
            });
            Q.all(memesPromise).then(memesData => {
                callback(memesData);
            });
        });
        return () => {
        };
    }

}

export let steemMemeService = new SteemBaseMemeService();
