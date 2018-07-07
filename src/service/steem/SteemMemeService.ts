import {MemeLinkInterface, MemeLoaderInterface, MemeServiceInterface} from "../generic/ApplicationInterface";
import {MemeLoader} from "./MemeLoader";
import {MemeLink} from "./MemeLink";

export class SteemMemeService implements MemeServiceInterface {
    memeLinkChache: { [id: string]: MemeLink; } = {};

    getMemeLoader(type: string, tags: string[]): MemeLoaderInterface {
        return new MemeLoader(type, tags);
    }

    getMemeLink(id: string,order:number): MemeLinkInterface {
        if (this.memeLinkChache[id] == undefined) {
            this.memeLinkChache[id] = new MemeLink(id,order);
        }
        if(this.memeLinkChache[id].order===NaN){
            this.memeLinkChache[id].order = order;
        }
        return this.memeLinkChache[id];
    }
}

export let steemMemeService = new SteemMemeService();
