//import {firebaseMemeService} from "../firebase/FirebaseMemeService";
import {steemMemeService} from "../steem/SteemMemeService";
import {MemeLoaderInterface, MemeServiceInterface} from "./ApplicationInterface";

export class MemeService implements MemeServiceInterface {

    vote(url: string): Promise<string> {
        return steemMemeService.vote(url);
    }

    getMemeLoader(type: string, tags: string[]): MemeLoaderInterface {
        return steemMemeService.getMemeLoader(type,tags);
    }

    post(title: string, body: string):Promise<string> {
        return steemMemeService.post(title,body);
    }

}

export let memeService = new MemeService();