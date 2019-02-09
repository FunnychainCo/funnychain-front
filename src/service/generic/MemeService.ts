import {firebaseMemeService} from "../firebase/FirebaseMemeService";
//import {steemMemeService} from "../steem/SteemMemeService";
import {MemeLinkInterface, MemeLoaderInterface, MemeServiceInterface} from "./ApplicationInterface";

export class MemeService implements MemeServiceInterface {

    getTags():string[]{
        return ["meme","funny"];
    }

    getMemeLoader(type: string, tags: string[]): MemeLoaderInterface {
        return firebaseMemeService.getMemeLoader(type,tags);
    }

    getMemeLoaderByUser(userid: string): MemeLoaderInterface {
        return firebaseMemeService.getMemeLoaderByUser(userid);
    }

    getMemeLink(id: string): MemeLinkInterface {
        return firebaseMemeService.getMemeLink(id);
    }

}

export let memeService = new MemeService();