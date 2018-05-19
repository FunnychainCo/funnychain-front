//import {fireBaseMemeService} from "../firebase/FireBaseMemeService";
import {steemMemeService} from "../steem/SteemMemeService";

export interface Meme{
    id:string,
    title:string,
    user:MemeUserData,
    imageUrl:string,
    created:Date
}

export interface MemeUserData{
    displayName:string,
    avatarUrl:string
}

export interface MemeServiceInterface {
    on(callback:(memes:Meme[]) => void):()=>void
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
}

export let memeProvider = new MemeService();