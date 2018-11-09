import {preLoadImage} from "../../ImageUtil";
import * as dsteem from "dsteem";
import {Meme, MEME_ENTRY_NO_VALUE} from "../../generic/Meme";
import {PROVIDER_STEEM} from "../../generic/UserEntry";
import {idService} from "../../IdService";
import {authService} from "../../generic/AuthService";
import {steemCommunityAccountService} from "../steemComunity/SteemCommunityAccountService";
import {firebaseUpvoteService} from "../../firebase/FirebaseUpvoteService";
import {audit} from "../../Audit";

export function getAvatarURLFromSteemUserAccount(steemUserAccount: string): string {
    return "https://steemitimages.com/u/" + steemUserAccount + "/avatar";
}

export function preloadImageWithFallBackURL(url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        preLoadImage(url).then(value => {
            resolve(value);
        }).catch(reason => {
            resolve("https://avatar.admin.rphstudio.net/avatar/avatars/avatar-067.jpeg");//default avatar //TODO use ipfs link
        });
    });
}

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

/*
TODO use that to avoid confusion between ids
interface SteemId extends String{

}*/

function hasVotedOnPost(steemPost: dsteem.Discussion): Promise<boolean> {
    return new Promise<boolean>(resolve => {
        authService.getLoggedUser().then(currentUserData => {
            let currentUser = currentUserData.uid;
            if (steemCommunityAccountService.isCommunityAccount(currentUser)) {
                firebaseUpvoteService.hasVotedOnPost(steemPost.url, steemCommunityAccountService.delegateUserEntry.uid).then(value => {
                    resolve(value);
                })
            } else {
                //user can be "" in case user is not authed
                let currentUserVoted = false;
                steemPost.active_votes.forEach((vote: any) => {
                    if (vote.voter === currentUser) {
                        currentUserVoted = true;
                    }
                });
                resolve(currentUserVoted)
            }
        });
    });
}

export function convertMeme(steemPost: dsteem.Discussion): Promise<Meme> {
    let promise = new Promise<Meme>((resolve, reject) => {
        try {
            let avatarURL = getAvatarURLFromSteemUserAccount(steemPost.author);
            let jsonMetaData: any = JSON.parse(steemPost.json_metadata);
            if (jsonMetaData.delegatedOwner !== undefined) {
                steemPost.author = jsonMetaData.delegatedOwner.name;
                avatarURL = jsonMetaData.delegatedOwner.url;
            }
            preloadImageWithFallBackURL(avatarURL).then((avatarUrl => {
                hasVotedOnPost(steemPost).then(currentUserVoted => {
                    firebaseUpvoteService.countVote(steemPost.url).then((communityVoteCount:number) => {
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
                                voteNumber: steemPost.net_votes + communityVoteCount,
                                dolarValue: Number(steemPost.pending_payout_value.toString().replace(" SBD", "")),
                                user: {
                                    uid: steemPost.author,
                                    provider: PROVIDER_STEEM,
                                    email: "",
                                    displayName: steemPost.author,
                                    avatarUrl: avatarUrl,
                                    wallet:0
                                },
                                currentUserVoted: currentUserVoted,
                                currentUserBet:false,
                                //order: orderNumber,
                                hot:false,
                                hotDate:new Date(),
                                betable:false
                            };
                            resolve(newMeme);
                        }).catch(reason => {
                            resolve(MEME_ENTRY_NO_VALUE);//resolve for q.all to work
                            audit.reportError(reason);//preload failed
                        });
                    })
                }).catch(reason => {
                    resolve(MEME_ENTRY_NO_VALUE);//resolve for q.all to work
                    audit.reportError(reason);
                });
            })).catch(reason => {
                resolve(MEME_ENTRY_NO_VALUE);//resolve for q.all to work
                audit.reportError(reason);
            });
        } catch (reason) {
            resolve(MEME_ENTRY_NO_VALUE);//resolve for q.all to work
            audit.reportError(reason);
        }
    });
    promise.catch(reason => {
        audit.reportError(reason);
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

export function replaceAll(target, search, replacement) {
    return target.replace(new RegExp(search, 'g'), replacement);
};

export function makePermalinkFromTitle(title: string): string {
    title = title.toLowerCase();
    title = replaceAll(title, /[^a-zA-Z]/, "2");
    title = title.replace(new RegExp(/[^\w\s]|(2)(?=\1)/gi, 'g'), "");//remove duplicate "2" char
    title = replaceAll(title, "2", "-");
    return title + idService.makeidAlpha(6).toLowerCase();
}