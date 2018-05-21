import {USER_ENTRY_NO_VALUE, UserEntry} from "./AuthService";

/**
 * MEME SERVICE
 */
export interface Meme {
    id: string,
    title: string,
    user: UserEntry,
    imageUrl: string,
    created: Date,
    dolarValue: number,
    voteNumber: number,
    commentNumber: number,
    currentUserVoted: boolean
}

export const MEME_ENTRY_NO_VALUE: Meme = {
    id: "",
    user: USER_ENTRY_NO_VALUE,
    title: "",
    imageUrl: "",
    created: new Date(),
    dolarValue: 42.10,
    voteNumber: 41,
    commentNumber: 5,
    currentUserVoted: false
};

export interface MemeComment {
    id: string,
    parentId: string,
    author: UserEntry,
    text: string
}

export interface MemeServiceInterface {
    on(callback: (memes: Meme[]) => void): () => void

    vote(url: string): Promise<string>
}

/**
 * COMMENT SERVICE
 */

export interface CommentsVisitor {
    on(callback: (comments: MemeComment[]) => void): () => void,

    loadMore(limit: number);

    postComment(parentPostId: string, message: string): Promise<String>;
}

export interface CommentServiceInterface {
    getCommentVisitor(id): CommentsVisitor
}

/**
 * USER SERVICE
 */

export interface UserServiceInterface {
    loadUserData(uid: string): Promise<UserEntry>,
}