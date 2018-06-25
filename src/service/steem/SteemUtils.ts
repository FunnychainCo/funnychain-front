import {preLoadImage} from "../ImageUtil";
import * as dsteem from "dsteem";
import {SteemVote} from "./SteemType";
import {steemAuthService} from "./SteemAuthService";
import {Meme, MEME_ENTRY_NO_VALUE} from "../generic/Meme";

export function loadUserAvatar(user: string): Promise<string> {
    /*return new Promise<string>((resolve, reject) => {
        steem.api.getAccounts([user], (err, result:SteemAccount[]) =>{
            preLoadImage(JSON.parse(result[0].json_metadata).profile.profile_image).then(value => {
                resolve(value);
            });
        });
    });*/
    return new Promise<string>((resolve, reject) => {
        preLoadImage("https://steemitimages.com/u/" + user + "/avatar").then(value => {
            resolve(value);
        }).catch(reason => {
            resolve("https://avatar.admin.rphstudio.net/avatar/avatars/avatar-067.jpeg");//default avatar
        });
    });
}

export function convertMeme(steemPost: dsteem.Discussion, orderNumber: number): Promise<Meme> {
    let promise = new Promise<Meme>((resolve, reject) => {
        loadUserAvatar(steemPost.author).then((avatarUrl => {
            let currentUserVoted = false;
            let currentUser = steemAuthService.currentUser.uid;
            //user can be "" in case user is not authed
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
            let memeImgUrl = jsonMetadata.image[0];
            preLoadImage(memeImgUrl).then(memeImgUrl => {
                let newMeme: Meme = {
                    id: steemPost.url,
                    created: new Date(steemPost.created),
                    title: steemPost.title,
                    imageUrl: memeImgUrl,
                    commentNumber: steemPost.children,
                    voteNumber: steemPost.net_votes,
                    dolarValue: Number(steemPost.pending_payout_value.toString().replace(" SBD", "")),
                    user: {
                        uid: steemPost.author,
                        displayName: steemPost.author,
                        avatarUrl: avatarUrl
                    },
                    currentUserVoted: currentUserVoted,
                    order: orderNumber
                };
                resolve(newMeme);
            });
        })).catch(reason => {
            resolve(MEME_ENTRY_NO_VALUE);//resolve for q.all to work
            console.error(reason);
        });
    });
    promise.catch(reason => {
        console.error(reason);
    });
    return promise;
}

export function getAuthorAndPermalink(url: string): { author: string, permalink: string } {
    let split = url.split("/");
    let author = split[2];
    author = author.substr(1, author.length);//remove @
    let permalink = split[3];
    return {
        author: author,
        permalink: permalink
    }
}

export function markdownImageLink(text: string): string {
    if (text.indexOf('![') != -1) {
        return text;//Markdown probably already applied //TODO find a better way to do that
    }
    let isImgUrl = /https?:\/\/.*?\.(?:png|jpg|jpeg|gif)/ig;
    return text.replace(isImgUrl, '\n![img]($&)\n');
}