import {audit} from "../log/Audit";
import {MemeDBEntry, MemeDBStruct} from "./shared/DBDefinition";
import axios from "axios";
import {GLOBAL_PROPERTIES} from "../../properties/properties";

export class MemeDatabase {

    fetchMemes(callback: (memes: MemeDBStruct) => void, type: string, userid: string, limit: number, lastPostDate: number): void {
        //console.log(GLOBAL_PROPERTIES.MEME_SERVICE() + "/fetch/memes",{type:type,userid:userid,limit:limit,lastPostDate:lastPostDate});
        axios.post(GLOBAL_PROPERTIES.MEME_SERVICE() + "/fetch/memes",{type:type,userid:userid,limit:limit,lastPostDate:lastPostDate}).then(response => {
            callback(response.data);
        }).catch(error => {
            audit.reportError(error);
        });
    }

    getMeme(id: string): Promise<MemeDBEntry> {
        return new Promise<MemeDBEntry>((resolve, reject) => {
            axios.get(GLOBAL_PROPERTIES.MEME_SERVICE() + "/get/"+id).then(response => {
                resolve(response.data);
            }).catch(error => {
                audit.reportError(error);
                reject(error);
            });
        });
    }

    postMeme(memeId: string, meme: MemeDBEntry): Promise<String> {
        return new Promise<String>((resolve, reject) => {
            axios.post(GLOBAL_PROPERTIES.MEME_SERVICE() + "/postV2", {memeId: memeId, meme: meme}).then(response => {
                resolve(response.data);
            }).catch(error => {
                audit.reportError(error);
                reject(error);
            });
        });
    }

}

export let memeDatabase = new MemeDatabase();
