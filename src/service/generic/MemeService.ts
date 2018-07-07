//import {firebaseMemeService} from "../firebase/FirebaseMemeService";
import {steemMemeService} from "../steem/SteemMemeService";
import {MemeLinkInterface, MemeLoaderInterface, MemeServiceInterface} from "./ApplicationInterface";
import {debugService} from "../debugService";

export class MemeService implements MemeServiceInterface {

    getTags():string[]{
        return debugService.testNetwork?["tag1"]:["meme","funny"];//TODO add funnychain tag change this
    }

    getMemeLoader(type: string, tags: string[]): MemeLoaderInterface {
        return steemMemeService.getMemeLoader(type,tags);
    }

    getMemeLink(id: string): MemeLinkInterface {
        return steemMemeService.getMemeLink(id);
    }

}

export let memeService = new MemeService();