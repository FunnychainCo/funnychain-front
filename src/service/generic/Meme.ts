import {USER_ENTRY_NO_VALUE, UserEntry} from "./UserEntry";

/**
 * MEME SERVICE
 */
export interface IPFSMeme{
    title: string,
    imageIPFSHash: string,//ipfs hash only
}

export interface Meme {
    id: string,
    title: string,
    user: UserEntry,
    imageUrl: string,
    created: Date,
    dolarValue: number,
    voteNumber: number,
    commentNumber: number,
    currentUserVoted: boolean,
    currentUserBet: boolean,
    order: number,
    hot:boolean,
    hotDate:Date,
    betable:boolean
}

export const MEME_TYPE_HOT:string = "hot";
export const MEME_TYPE_FRESH:string = "fresh";
export const MEME_TYPE_TRENDING:string = "trending";

export const MEME_ENTRY_NO_VALUE: Meme = Object.freeze({
    id: "",
    user: USER_ENTRY_NO_VALUE,
    title: "",
    imageUrl: "",
    created: new Date(2018, 11, 24, 10, 33, 30, 0),
    dolarValue: 0.0,
    voteNumber: 0,
    commentNumber: 0,
    currentUserVoted: false,
    currentUserBet: false,
    order:0,
    hot:false,
    hotDate: new Date(2018, 11, 24, 10, 33, 30, 0),
    betable:false
});