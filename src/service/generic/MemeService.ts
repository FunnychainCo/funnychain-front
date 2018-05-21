//import {firebaseMemeService} from "../firebase/FirebaseMemeService";
import {steemMemeService} from "../steem/SteemMemeService";
import {Meme, MemeServiceInterface} from "./ApplicationInterface";

export class MemeService implements MemeServiceInterface{

    on(callback:(memes:Meme[]) => void):()=>void {
        /*return firebaseMemeService.on(memes => {
            callback(memes);
        });*/
        return steemMemeService.on(memes => {
            callback(memes);
        });
    }

}

export let memeService = new MemeService();