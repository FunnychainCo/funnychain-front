import {
    MemeLinkInterface,
    MemeLoaderInterface,
} from "../../generic/ApplicationInterface";
import * as Q from 'q';
import {Meme, MEME_TYPE_FRESH, MEME_TYPE_HOT} from "../../generic/Meme";
import EventEmitter from "eventemitter3";
import {MemeDBEntry, MemeDBStruct} from "../../database/shared/DBDefinition";
import {audit} from "../../log/Audit";
import {firebaseMemeService} from "./FirebaseMemeService";
import {MemeLink} from "./MemeLink";
import {loadMeme} from "./MemeLoaderFunction";
import {memeDatabase} from "../../database/MemeDatabase";
import {TaskPoolExecutor} from "../../concurency/TaskPoolExecutor";

export class MemeLoader implements MemeLoaderInterface {

    readonly EVENT_ON_MEME = "onMeme";
    readonly EVENT_ON_MEME_DATA = "onMemeData";
    readonly EVENT_ON_MEME_ORDER = "onMemeOrder";
    readonly EVENT_ON_INITIAL_LOADING_FINISHED = "onInitialLoadingFinished";
    eventEmitter = new EventEmitter();
    lastPostDate: number = new Date().getTime();
    private pool: TaskPoolExecutor;


    constructor(public type: string, public tags: string[], public userid: string) {
        this.pool = new TaskPoolExecutor();
        this.pool.start();
    }

    loadMore(limit: number): void {
        this.pool.addResolvableTask((resolve, reject) => {
            if (limit < 0) {
                resolve(true);
                audit.reportError("negative limit");
            }
            if (limit <= 0) {
                resolve(true);
                return;
            }

            memeDatabase.fetchMemes(memes => {
                let memesVal: MemeDBStruct = memes;
                let firebaseMemes: MemeDBEntry[] = [];
                Object.keys(memesVal).forEach(key => {
                    let memeVal: MemeDBEntry = memesVal[key];
                    if (this.lastPostDate > memeVal.created) {
                        this.lastPostDate = memeVal.created;
                    }
                    if (this.type !== "") {
                        if (this.type == MEME_TYPE_HOT && memeVal.hot) {
                            firebaseMemes.push(memeVal);
                        }
                        if (this.type == MEME_TYPE_FRESH && !memeVal.hot) {
                            firebaseMemes.push(memeVal);
                        }
                    }
                    if (this.userid !== "") {
                        if (this.userid === memeVal.uid) {
                            firebaseMemes.push(memeVal);
                        }
                    }
                });
                //sort meme by creation time and filter them
                firebaseMemes.sort((a, b) => {
                    return a.created - b.created;
                });
                let orderedMemeKeys: string[] = [];
                firebaseMemes.forEach(fireBaseMeme => {
                    let hash = fireBaseMeme.memeIpfsHash;
                    orderedMemeKeys.push(hash);
                });
                //notify memes
                firebaseMemes = firebaseMemes.filter(meme => {
                    return orderedMemeKeys.indexOf(meme.memeIpfsHash)>=0;
                });
                if (orderedMemeKeys.length > 0) {
                    //notify memes
                    this.eventEmitter.emit(this.EVENT_ON_MEME_ORDER, orderedMemeKeys);
                    this.convertor(firebaseMemes).then(memeLinkData => {
                        this.eventEmitter.emit(this.EVENT_ON_MEME, memeLinkData);
                        resolve(true);
                        //check if more memes needs to be loaded
                        if (Object.keys(memesVal).length != 0) {
                            this.loadMore(limit - orderedMemeKeys.length);//TODO find a better system to load type fresh and hot
                        }
                    });
                }else{
                    //check if more memes needs to be loaded
                    if (Object.keys(memesVal).length != 0) {
                        this.loadMore(limit - orderedMemeKeys.length);//TODO find a better system to load type fresh and hot
                    }
                    resolve(true);
                    return;
                }

            }, this.type, this.userid, limit, this.lastPostDate);
        });
    }

    private convertor(memes: MemeDBEntry[]): Promise<MemeLinkInterface[]> {
        return new Promise<MemeLinkInterface[]>(resolve => {
            let memesPromise: Promise<Meme>[] = [];
            Object.keys(memes).forEach(memeID => {
                let meme: MemeDBEntry = memes[memeID];
                let promise = loadMeme(meme);
                promise.then(convertedMeme => {
                    let memeLink = firebaseMemeService.getMemeLink(convertedMeme.id);
                    (memeLink as MemeLink).setMeme(convertedMeme);
                    this.eventEmitter.emit(this.EVENT_ON_MEME_DATA, memeLink);
                });
                memesPromise.push(promise);
            });
            Q.all(memesPromise).then(memes => {
                let memeLinkData: MemeLinkInterface[] = [];
                memes.forEach((value: Meme) => {
                    let memeLink = firebaseMemeService.getMemeLink(value.id);
                    (memeLink as MemeLink).setMeme(value);
                    memeLinkData.push(memeLink);
                });
                resolve(memeLinkData);
            });
        })
    };

    /**
     * Callback are sorted by meme creation time and in the callback the list is sorted by meme creation time (newest first)
     * @param {(memes: MemeLinkInterface[]) => void} callback
     * @returns {() => void}
     */
    on(callback: (memes: MemeLinkInterface[]) => void): () => void {
        this.eventEmitter.on(this.EVENT_ON_MEME, callback);
        return () => {
            this.eventEmitter.off(this.EVENT_ON_MEME, callback);
        };
    }

    onInitialLoadingFinished(callback: () => void): () => void {
        this.eventEmitter.on(this.EVENT_ON_INITIAL_LOADING_FINISHED, callback);
        return () => {
            this.eventEmitter.off(this.EVENT_ON_INITIAL_LOADING_FINISHED, callback);
        };
    }

    /**
     * Called randomlly as meme data are loaded (no order guaranted)
     * @param {(meme: MemeLinkInterface) => void} callback
     * @returns {() => void}
     */
    onMemeData(callback: (meme: MemeLinkInterface) => void): () => void {
        this.eventEmitter.on(this.EVENT_ON_MEME_DATA, callback);
        return () => {
            this.eventEmitter.off(this.EVENT_ON_MEME_DATA, callback);
        };
    }

    /**
     * Ordoned List Of Meme IDs
     * @param {(memesId: string[]) => void} callback
     * @returns {() => void}
     */
    onMemeOrder(callback: (memesId: string[]) => void): () => void {
        this.eventEmitter.on(this.EVENT_ON_MEME_ORDER, callback);
        return () => {
            this.eventEmitter.off(this.EVENT_ON_MEME_ORDER, callback);
        };
    }

    refresh() {
        this.lastPostDate = new Date().getTime();
    }

}