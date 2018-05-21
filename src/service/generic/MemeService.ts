//import {fireBaseMemeService} from "../firebase/FireBaseMemeService";
import {steemMemeService} from "../steem/SteemMemeService";

export interface Meme{
    id:string,
    title:string,
    user:MemeUserData,
    imageUrl:string,
    created:Date,
    dolarValue: number,
    voteNumber: number,
    commentNumber: number
}

export interface MemeComment{
    id:string,
    parentId:string,
    author:MemeUserData,
    text:string
}

export interface CommentsVisitor{
    on(callback: (comments: MemeComment[]) => void): () => void,
    loadMore(limit:number);
}

export interface MemeUserData{
    displayName:string,
    avatarUrl:string
}

export interface MemeServiceInterface {
    on(callback:(memes:Meme[]) => void):()=>void,
    getCommentVisitor(id):CommentsVisitor
}

export class MemeService implements MemeServiceInterface{

    on(callback:(memes:Meme[]) => void):()=>void {
        /*return fireBaseMemeService.on(memes => {
            callback(memes);
        });*/
        return steemMemeService.on(memes => {
            callback(memes);
        });
    }

    getCommentVisitor(id): CommentsVisitor {
        return steemMemeService.getCommentVisitor(id);
    }
}

export let memeService = new MemeService();