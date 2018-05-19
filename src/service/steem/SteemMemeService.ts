import {Meme, MemeServiceInterface} from "../generic/MemeService";
import steem from 'steem';

export class SteemBaseMemeService implements MemeServiceInterface{

    on(callback:(memes:Meme[]) => void):()=>void {
        //https://steemit.com/steemjs/@morning/steem-api-guide-how-to-get-recent-posts-getdiscussionsbycreated-load-more-and-pagination
        steem.api.getDiscussionsByTrending({"tag": "dmania", "limit": 10}, (err, result:SteemPost[]) => {
            let retMemes:Meme[]=[];
            result.forEach((value:SteemPost) => {
                //json_metadata:"{"tags":["dmania","meme","funny","punchline","lol"],"image":["https://s3-eu-west-1.amazonaws.com/dmania-images/machine-learning-f4p3k2i.jpg"],"app":"dmania/0.7"}"
                let jsonMetadata:{
                    tags:string[],
                    image:string[],
                    app:string[]
                } = JSON.parse(value.json_metadata);
                let newMeme:Meme = {
                    id:value.id+"",
                    created:new Date(value.created),
                    title:value.title,
                    imageUrl:jsonMetadata.image[0],
                    user:{
                        displayName:value.author,
                        avatarUrl:"" //TODO fetch user avatar url
                    }
                }
                retMemes.push(newMeme);
            });
            callback(retMemes);
        });
        return ()=>{};
    }
}

interface SteemPost {
    abs_rshares: string,
    active: string,
    active_votes: any,
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
