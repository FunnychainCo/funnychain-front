import {MemeDBEntry} from "./shared/DBDefinition";
import {GLOBAL_PROPERTIES} from "../../properties/properties";
import {MemeApi} from "funnychain-lib-meme/dist";

export class MemeDatabase {
    private memes: MemeApi;

    constructor(){
        this.memes = new MemeApi(GLOBAL_PROPERTIES.MEME_SERVICE());
    }

    fetchMemesById(type: string, userid: string, limit: number, lastPostDate: number): Promise<string[]> {
        return this.memes.fetchMemesById(type,userid,limit,lastPostDate);
    }

    fetchMemes(type: string, userid: string, limit: number, lastPostDate: number): Promise<MemeDBEntry[]> {
        return this.memes.fetchMemes(type,userid,limit,lastPostDate);
    }

    getMeme(id: string): Promise<MemeDBEntry> {
        return this.memes.getMeme(id);
    }

    postMeme(memeId: string, meme: MemeDBEntry): Promise<String> {
        return this.memes.insertMeme(memeId,meme);
    }

}

export let memeDatabase = new MemeDatabase();
