import {MemeLinkInterface, MemeLoaderInterface, MemeServiceInterface} from "../generic/ApplicationInterface";
import {MemeLoader} from "./MemeLoader";
import {MemeLink} from "./MemeLink";

export class SteemMemeService implements MemeServiceInterface {
    memeLinkChache: { [id: string]: MemeLink; } = {};

    getMemeLoader(type: string, tags: string[]): MemeLoaderInterface {
        return new MemeLoader(type, tags);
    }

    getMemeLink(id: string): MemeLinkInterface {
        if (this.memeLinkChache[id] == undefined) {
            this.memeLinkChache[id] = new MemeLink(id);
        }
        return this.memeLinkChache[id];
    }
}

export let steemMemeService = new SteemMemeService();
