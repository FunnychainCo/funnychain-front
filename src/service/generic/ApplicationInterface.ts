import {UserEntry} from "./UserEntry";
import {Meme} from "./Meme";

export interface MemeComment {
    id: string,
    parentId: string,
    author: UserEntry,
    text: string,
    flagged : boolean
}

export interface MemeLoaderInterface {
    on(callback: (memes: Meme[]) => void): () => void,
    loadMore(limit:number),
    refresh()
}

export interface MemeLinkInterface {
    on(callback: (memes: Meme) => void): () => void,
    refresh():Promise<any>
}

export interface MemeServiceInterface {
    getMemeLoader(type:string,tags:string[]):MemeLoaderInterface
    vote(url: string): Promise<string>,
    post(title:string,body:string):Promise<string>
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

/**
 * File Upload Interface
 */

export interface FileUploadServiceInterface{
    uploadFile(file:File):Promise<UploadedDataInterface>
}

export interface UploadedDataInterface{
    fileURL:string,
    fileId:string
}

