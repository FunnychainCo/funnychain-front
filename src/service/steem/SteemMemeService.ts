import {CommentsVisitor, Meme, MemeComment, MemeServiceInterface} from "../generic/MemeService";
import steem from 'steem';
import * as EventEmitter from "eventemitter3";
import {preLoadImage} from "../ImageUtil";
import * as Q from "q";

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

    getCommentVisitor(id):CommentsVisitor{
        return new SteemCommentsVisitor(id);
    }
}

export function loadUserAvatar(user:string):Promise<string>{
    /*return new Promise<string>((resolve, reject) => {
        steem.api.getAccounts([user], (err, result:SteemAccount[]) =>{
            preLoadImage(JSON.parse(result[0].json_metadata).profile.profile_image).then(value => {
                resolve(value);
            });
        });
    });*/
    return new Promise<string>((resolve, reject) => {
        preLoadImage("https://steemitimages.com/u/"+user+"/avatar").then(value => {
            resolve(value);
        }).catch(reason => {
            resolve("https://avatar.admin.rphstudio.net/avatar/avatars/avatar-067.jpeg");//default avatar
        });
    });
}

export function markdownImageLink(text:string):string{
    if(text.indexOf('![')!=-1){
        return text;//Markdown probably already applied //TODO find a better way to do that
    }
    let isImgUrl= /https?:\/\/.*?\.(?:png|jpg|jpeg|gif)/ig;
    return text.replace(isImgUrl,'\n![img]($&)\n');
}

export class SteemCommentsVisitor implements CommentsVisitor{
    emitter = new EventEmitter();
    id:string;
    author:string;
    permalink:string;
    allDataLoaded:boolean=false;

    constructor(id) {
        this.id = id;
        let split = this.id.split("/");
        this.author = split[2];
        this.author = this.author.substr(1, this.author.length);//remove @
        this.permalink = split[3];
    }

    on(callback: (memes: MemeComment[]) => void): () => void {
        this.emitter.on("onNewComment"+this.id,callback);
        return () => {
            this.emitter.off("onNewComment"+this.id,callback);
        };
    }

    loadMore(limit:number){
        if(this.allDataLoaded==true){
            return;
        }
        let memesComments:Promise<MemeComment>[] = [];
        //steem.api.getRepliesByLastUpdate(this.author, this.permalink, limit, (err, results: SteemReplies[]) => {
        steem.api.getContentReplies(this.author, this.permalink, (err, results: SteemReplies[]) => {
            ///dmania/@sanmi/the-real-meaning-of-followerspeople-still-celebratei-feel-we-need-an-auto-unfollow-mechanism-zg1hbmlh-9omhu
            results.forEach((comment: SteemReplies) => {
                if(Number(steem.formatter.reputation(comment.author_reputation))<15){
                    return;
                }
                memesComments.push(new Promise<MemeComment>((resolve, reject) => {

                    loadUserAvatar(comment.author).then((avatarUrl => {
                        let memeComment: MemeComment = {
                            author: {
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
                this.allDataLoaded=true;
                this.emitter.emit("onNewComment"+this.id,comments);
            });
        });
    }
}

interface SteemVote {
    percent: number,
    reputation: string,
    rshares: number | string,
    time: string,
    voter: string,
    weight: number
}

interface SteemReplies {
    bs_rshares: number,
    active: string,
    active_votes: SteemVote[],
    allow_curation_rewards: boolean,
    allow_replies: boolean,
    allow_votes: boolean,
    author: string,
    author_reputation: string,
    author_rewards: number,
    beneficiaries: any[],
    body: string,
    body_length: number,
    cashout_time: string,
    category: string,
    children: number,
    children_abs_rshares: number,
    created: string,
    curator_payout_value: string,
    depth: number,
    id: number,
    json_metadata: string,
    last_payout: string,
    last_update: string,
    max_accepted_payout: string,
    max_cashout_time: string,
    net_rshares: number,
    net_votes: number,
    parent_author: string,
    parent_permlink: string,
    pending_payout_value: string,
    percent_steem_dollars: number,
    permlink: string,
    promoted: string,
    reblogged_by: any[],
    replies: any[],
    reward_weight: number,
    root_author: string,
    root_permlink: string,
    root_title: string,
    title: string,
    total_payout_value: string,
    total_pending_payout_value: string,
    total_vote_weight: number,
    url: string,
    vote_rshares: number,
}

export interface SteemAccount{
    active:any,
    average_bandwidth:string,
    average_market_bandwidth:number,
    balance:string,
    can_vote:boolean,
    comment_count:number,
    created:string,
    curation_rewards:number,
    delegated_vesting_shares:string,
    guest_bloggers:any[],
    id:number,
    json_metadata:string,
    last_account_update:string,
    last_bandwidth_update:string,
    last_market_bandwidth_update:string,
    last_owner_update:string,
    last_post:string,
    last_root_post:string,
    last_vote_time:string,
    lifetime_bandwidth:string,
    lifetime_market_bandwidth:number,
    lifetime_vote_count:number,
    market_history:any[],
    memo_key:string,
    mined:boolean,
    name:string,
    next_vesting_withdrawal:string,
    other_history:any[],
    owner:any,
    post_count:number,
    post_history:any[],
    posting:any,
    posting_rewards:number,
    proxied_vsf_votes:any,
    proxy:string,
    received_vesting_shares:string,
    recovery_account:string,
    reputation:number,
    reset_account:string,
    reward_sbd_balance:string,
    reward_steem_balance:string,
    reward_vesting_balance:string,
    reward_vesting_steem:string,
    savings_balance:string,
    savings_sbd_balance:string,
    savings_sbd_last_interest_payment:string,
    savings_sbd_seconds:string,
    savings_sbd_seconds_last_update:string,
    savings_withdraw_requests:number,
    sbd_balance:string,
    sbd_last_interest_payment:string,
    sbd_seconds:string,
    sbd_seconds_last_update:string,
    tags_usage:any[],
    to_withdraw:number,
    transfer_history:any[],
    vesting_balance:string,
    vesting_shares:string,
    vesting_withdraw_rate:string,
    vote_history:any[],
    voting_power:number,
    withdraw_routes:number,
    withdrawn:number,
    witness_votes:any[],
    witnesses_voted_for:number,
}

interface SteemPost {
    abs_rshares: string,
    active: string,
    active_votes: SteemVote[],
    allow_curation_rewards: boolean,
    allow_replies: boolean,
    allow_votes: boolean,
    author: string,
    author_reputation: string,
    author_rewards: number,
    beneficiaries: any,
    body: any,
    body_length: number,
    cashout_time: string,
    category: string,
    children: number,
    children_abs_rshares: string,
    created: string,
    curator_payout_value: string,
    depth: number,
    id: number,
    json_metadata: string,
    last_payout: string,
    last_update: string,
    max_accepted_payout: string,
    max_cashout_time: string,
    net_rshares: string,
    net_votes: number,
    parent_author: string,
    parent_permlink: string,
    pending_payout_value: string,
    percent_steem_dollars: number,
    permlink: string,
    promoted: string
    reblogged_by: any,
    replies: any,
    reward_weight: number,
    root_author: string,
    root_permlink: string,
    root_title: string,
    title: string,
    total_payout_value: string,
    total_pending_payout_value: string,
    total_vote_weight: number,
    url: string,
    vote_rshares: string
}

export let steemMemeService = new SteemBaseMemeService();
