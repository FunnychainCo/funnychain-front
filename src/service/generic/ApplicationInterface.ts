import {UserEntry} from "./AuthService";

/**
 * MEME SERVICE
 */
export interface Meme{
    id:string,
    title:string,
    user:OtherUserData,
    imageUrl:string,
    created:Date,
    dolarValue: number,
    voteNumber: number,
    commentNumber: number
}

export interface MemeComment{
    id:string,
    parentId:string,
    author:OtherUserData,
    text:string
}

export interface OtherUserData{
    displayName:string,
    avatarUrl:string
}

export interface MemeServiceInterface {
    on(callback:(memes:Meme[]) => void):()=>void
}

/**
 * COMMENT SERVICE
 */

export interface CommentsVisitor{
    on(callback: (comments: MemeComment[]) => void): () => void,
    loadMore(limit:number);
}

export interface CommentServiceInterface {
    getCommentVisitor(id):CommentsVisitor
}

/**
 * USER SERVICE
 */

export interface UserServiceInterface {
    loadUserData(uid:string):Promise<UserEntry>,
}