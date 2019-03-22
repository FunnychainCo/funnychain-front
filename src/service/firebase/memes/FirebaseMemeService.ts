import {
    MemeLinkInterface,
    MemeLoaderInterface,
    MemeServiceInterface
} from "../../generic/ApplicationInterface";
import {MemeLoader} from "./MemeLoader";
import {MemeLink} from "./MemeLink";
import {MemeByUserLoader} from "./MemeByUserLoader";

export class FirebaseMemeService implements MemeServiceInterface {

    memeLinkCache: { [id: string]: MemeLink; } = {};

    getMemeLink(id: string): MemeLinkInterface {
        if (this.memeLinkCache[id] == undefined) {
            this.memeLinkCache[id] = new MemeLink(id);
        }
        return this.memeLinkCache[id];
    }

    getMemeLoader(type: string, tags: string[]): MemeLoaderInterface {
        return new MemeLoader(type,tags,"");
    }

    getMemeLoaderByUser(userid: string): MemeLoaderInterface {
        return new MemeByUserLoader(userid);
    }

}

export let firebaseMemeService = new FirebaseMemeService();
