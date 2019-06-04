import {
    MemeLinkInterface,
    MemeLoaderInterface,
} from "../../generic/ApplicationInterface";
import * as Q from 'q';
import {Meme} from "../../generic/Meme";
import EventEmitter from "eventemitter3";
import {MemeDBEntry} from "../../database/shared/DBDefinition";
import {audit} from "../../log/Audit";
import {firebaseMemeService} from "./FirebaseMemeService";
import {MemeLink} from "./MemeLink";
import {loadMeme} from "./MemeLoaderFunction";
import {memeDatabase} from "../../database/MemeDatabase";
import {userDatabase} from "../../database/UserDatabase";
import {idleTaskPoolExecutor} from "../../generic/IdleTaskPoolExecutorService";
import {IdleTaskPoolExecutor} from "../../concurency/IdleTaskPoolExecutor";

export class MemeByUserLoader implements MemeLoaderInterface {

    readonly EVENT_ON_MEME = "onMeme";
    readonly EVENT_ON_MEME_DATA = "onMemeData";
    readonly EVENT_ON_MEME_ORDER = "onMemeOrder";
    readonly EVENT_ON_INITIAL_LOADING_FINISHED = "onInitialLoadingFinished";
    lastPostDate: number = new Date().getTime();
    alreadyProvided: number = 0;
    eventEmitter = new EventEmitter();
    private pool: IdleTaskPoolExecutor;
    memes = [];


    constructor(public userid: string) {
        this.pool = idleTaskPoolExecutor;//concurrency limit of 1
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
            ////////////////
            //Load user memes
            ////////////////
            let memes;
            if (this.memes.length == 0) {
                //force refresh
                memes = new Promise(resolveMemes => {
                    userDatabase.getUserMemeKeys(this.userid).then(memeKeys => {
                        let promiseList: Promise<any>[] = [];
                        Object.keys(memeKeys).forEach(memekey => {
                            promiseList.push(new Promise<any>(resolveMeme => {
                                memeDatabase.getMeme(memekey).then(memeVal => {
                                    resolveMeme(memeVal);
                                });
                            }));
                        });
                        Promise.all(promiseList).then(memeList => {
                            memeList = memeList.filter(item => {
                                return item!==null;
                            });
                            resolveMemes(memeList);
                        });
                    });
                });
            } else {
                memes = Promise.resolve(this.memes);
            }
            /////////////////
            // Notify memes
            /////////////////
            memes.then((memesVal) => {
                let firebaseMemes: MemeDBEntry[] = [];
                Object.keys(memesVal).forEach(key => {
                    let memeVal: MemeDBEntry = memesVal[key];
                    if (this.userid === memeVal.uid) {
                        firebaseMemes.push(memeVal);
                    }
                });
                //sort meme by creation time
                firebaseMemes.sort((a, b) => {
                    return b.created - a.created;
                });
                let orderedMemeKeys: string[] = [];
                firebaseMemes.forEach(fireBaseMeme => {
                    orderedMemeKeys.push(fireBaseMeme.memeIpfsHash);
                });

                let orderedMemeSubsetKeys = orderedMemeKeys.slice(this.alreadyProvided, this.alreadyProvided + limit);
                let orderedMemeSubset = firebaseMemes.slice(this.alreadyProvided, this.alreadyProvided + limit);
                this.alreadyProvided += orderedMemeSubsetKeys.length;
                if (orderedMemeSubsetKeys.length == 0) {
                    this.eventEmitter.emit(this.EVENT_ON_INITIAL_LOADING_FINISHED, {});
                }

                if (orderedMemeSubsetKeys.length > 0) {
                    this.eventEmitter.emit(this.EVENT_ON_MEME_ORDER, orderedMemeSubsetKeys);
                }
                this.convertor(orderedMemeSubset).then(memeLinkData => {
                    this.eventEmitter.emit(this.EVENT_ON_MEME, memeLinkData);
                    resolve(true);
                    if (Object.keys(memesVal).length != 0) {
                        let loadMoreNb = limit - firebaseMemes.length;
                        if (loadMoreNb > 0) {
                            this.loadMore(loadMoreNb);
                        }
                    }
                });
            });
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

    onInitialLoadingFinished(callback: () => void): () => void {
        this.eventEmitter.on(this.EVENT_ON_INITIAL_LOADING_FINISHED, callback);
        return () => {
            this.eventEmitter.off(this.EVENT_ON_INITIAL_LOADING_FINISHED, callback);
        };
    }

    refresh() {
        this.lastPostDate = new Date().getTime();
        this.alreadyProvided = 0;
        this.memes = [];
    }

}