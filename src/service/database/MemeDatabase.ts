import * as firebase from "firebase";
import {audit} from "../log/Audit";
import {DATABASE_MEMES, MemeDBEntry, MemeDBStruct} from "./shared/DBDefinition";
import {MEME_TYPE_HOT} from "../generic/Meme";

export class MemeDatabase {

    fetchMemes(callback: (memes: MemeDBStruct) => void, type: string, userid: string, limit: number, lastPostDate: number): void {
        let query;
        if (type !== "") {
            let hot = type == MEME_TYPE_HOT;
            query = firebase.database().ref(DATABASE_MEMES).orderByChild(hot ? 'hot' : 'created').endAt(lastPostDate - 1);
        } else if (userid !== "") {
            query = firebase.database().ref(DATABASE_MEMES).orderByChild('created').endAt(lastPostDate - 1);
        } else {
            throw new Error();
        }

        let ref = query.limitToLast(limit);
        ref.once("value", (memes) => {
            let memesVal: MemeDBStruct = memes.val() || {};
            callback(memesVal);
        }).catch((err) => {
            audit.error(err);
        });
    }

    getMeme(id: string): Promise<MemeDBEntry> {
        return new Promise<MemeDBEntry>((resolve, reject) => {
            firebase.database().ref(DATABASE_MEMES + "/" + id).once("value", (meme) => {
                if (meme == null) {
                    audit.reportError(meme);
                    return;
                }
                resolve(meme.val() || {});
            });
        });
    }

    postMeme(memeId: string, meme: MemeDBEntry): Promise<String> {
        return new Promise<String>((resolve, reject) => {
            if (memeId === "" || !memeId) {
                audit.error("wrong id :" + memeId);
                reject("wrong id :" + memeId);
                return;
            }
            firebase.database().ref(DATABASE_MEMES + '/' + memeId).set(meme).then(() => {
                resolve("ok");
            });
        });
    }

}

export let memeDatabase = new MemeDatabase();
