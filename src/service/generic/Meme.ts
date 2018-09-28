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
    order: number
}

export const MEME_ENTRY_NO_VALUE: Meme = Object.freeze({
    id: "",
    user: USER_ENTRY_NO_VALUE,
    title: "",
    imageUrl: "",
    created: new Date(),
    dolarValue: 42.10,
    voteNumber: 41,
    commentNumber: 5,
    currentUserVoted: false,
    order:0,
});