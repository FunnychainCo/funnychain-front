import {
    MemeLinkInterface,
    MemeLoaderInterface,
} from "../../generic/ApplicationInterface";
import * as Q from 'q';
import {Meme, MEME_TYPE_FRESH, MEME_TYPE_HOT} from "../../generic/Meme";
import EventEmitter from "eventemitter3";
import {MemeDBEntry, MemeDBStruct} from "../../database/shared/DBDefinition";
import {PromisePoolExecutor} from "promise-pool-executor";
import {audit} from "../../log/Audit";
import {firebaseMemeService} from "./FirebaseMemeService";
import {MemeLink} from "./MemeLink";
import {loadMeme} from "./MemeLoaderFunction";
import {memeDatabase} from "../../database/MemeDatabase";
import {deviceDetector} from "../../mobile/DeviceDetector";

let blehmemewebp = [
    "QmQbt1wkDFW2shdrrohQiBCF6xwZqqD5D5m86wMMXnosAf",
    "QmdqQMDmkqYz2uPrNEBavWofHWHqmFZEp6wSqYfHZeAcZg",
    "QmXNh3phwjq1ff8FsBFvU9Wd63cpb7iRewimp698dt9ibr",
    "QmQGMa72eXEYVrusJfEyviJmdCatvbBR8Ak53ztNHSFnZT",
    "QmNsUcvmPbjb2Y1X6RPeB1snRKCSh5x1vucTcsAddGgErJ",
    "QmXdr68uC9FohZ8WQQT928iaW2oshZutWjwSX3m9eESbkL",
    "QmTXbfoftHRWQkYuKbKw3pT956xM4DAALe3VszLt4WSpgN",
    "QmaXM3th8dhWTuVHQHoTgHgs9ota5QCbud5HPEXP6xii7W",
    "QmfX6vW2xgvtbw9yjoJjg9yzUcSLj1eWhugnwVxKwwntCs",
    "QmUFwr8Rirwo9SeasiCMyyCdSzuQ6si4wvnNE6jsdgHvTj",
    "QmUt5cGPaVQX5ZNAyN6D86hVeUefrgUZ2TcMDFhrSRCk49",
    "QmfDVpcB16zK7cXSVWkR6KBDrBnpmWugNu29BDffYnZjnE",
    "QmT2s8sHDc59WeRTKGXbKSwpd32qBRgvhPyz7utHXMQpnp",
    "QmPpbHHRHSA1wctF9P1bPqRNps5hqENWGDYSjVRcY7mCKP",
    "QmVz31KDFaw9jsPKpnishjAdXn7hXbJbMWQfK7GPAcjJoD",
    "QmWX2DLTrD2Ue3rcLvqSd9iVU1ikjivnsJ24e9bWRMP3fW",
    "QmcJSwbdfbJmPGbBqPx6U1tq8Ua6gh8VSqTwFAjAoWwwRV",
    "QmNbkMkjRigCqJA1SCcqgaF9RdTN8ffSgrTLUxck9HNJWX",
    "QmcxCPE3nJJnM6dpe3px5W7LE3ys2STB5BLTmHTiCsFJDN",
    "QmQVhsChbdVzPBCDPerr793QBuRf8Jcx9BaFrZnqNAYm2T",
    "QmRnc8rSJkz5hbKRYbf3bLLMmQ2mirsfdzH2z2pNqSH6CV",
    "QmYKAbgfpq7aVVZ53aZG2zKNtS3Q1m2EYAQja63Jj38fWF",
    "QmRGaqTRqWPLxWvR2dRJZCXxbRXjxvSUM9ZmwFUXJBxbPq",
    "QmQP622ZaEs3jwB5FvffaHhpM8ob62f8X5x3Z33M4uS44m",
    "Qmenyv7vJZnzjxCwGuJuYFDM2XRNBoAUK31vXBEgAH82uo",
    "Qmf6xPHDWCohZ6evz4J87M8U9dLSoZh52GC18u7KFEAJnD",
    "QmXN1oEV8ZCSVgHck4sJQcmHLq3ijWrNhJp9UxMpTQSbKr",
    "QmVbwkiLEwLjGh9CQ5fYTqyQeCkNeMG2f8oZBy8kCNXAv7",
    "QmUQmeq6tDZAFVPspCknuHWfb73RYgYfUYmWffkWx5yEfW",
    "QmXC9Zy9FbfnArBKZzkA2RxD5UT9BueiqGyjQ4unYsvrAK",
    "QmYap6DD2qxqMWYKHGNfTGAPh65VkF7tmjzUTRdoCMcyzL",
    "QmZJrcpTpq5RhwtF8zuys2CMhgg1jHQySuC3xJd1iGsPLv",
    "QmdeRV8FtZW1zFqZWFKCHmMGVM6ns7fGbPp68pq68we5GJ",
    "QmSiyT8F5rPfXCAUuEnYCeCQEkeK38NZNGgjgZtJuT1Doh",
    "QmXpiLjDZXSZmPgWVUxXtomqxu8ryCH422KsXNDJbWE57k",
    "QmeeTNhrekm551bNoATdYAW6BBFMt9sTcQEPXrywVEtufh",
    "QmeeTNhrekm551bNoATdYAW6BBFMt9sTcQEPXrywVEtufh",
    "QmP7b9LbDQCW3o2sA87i9yziKgUPtscTta68CZz89NATDy"];

export class MemeLoader implements MemeLoaderInterface {

    readonly EVENT_ON_MEME = "onMeme";
    readonly EVENT_ON_MEME_DATA = "onMemeData";
    readonly EVENT_ON_MEME_ORDER = "onMemeOrder";
    readonly EVENT_ON_INITIAL_LOADING_FINISHED = "onInitialLoadingFinished";
    eventEmitter = new EventEmitter();
    lastPostDate: number = new Date().getTime();
    private pool: PromisePoolExecutor;


    constructor(public type: string, public tags: string[], public userid: string) {
        this.pool = new PromisePoolExecutor(1);//concurrency limit of 1
    }

    loadMore(limit: number): void {
        this.pool.addSingleTask({
            generator: () => {
                return new Promise(resolve => {
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
                            orderedMemeKeys.push(fireBaseMeme.memeIpfsHash);
                        });
                        orderedMemeKeys = orderedMemeKeys.filter(hash => {
                            if(deviceDetector.isIPhone()) {
                                return blehmemewebp.indexOf(hash) < 0;
                            }else{
                                return true;
                            }
                        });

                        //notify memes
                        firebaseMemes = firebaseMemes.filter(meme => {
                            if(orderedMemeKeys.indexOf(meme.memeIpfsHash)>=0){
                                return true;
                            }else{
                                return false;
                            }
                        });
                        if (orderedMemeKeys.length > 0) {
                            //notify memes
                            this.eventEmitter.emit(this.EVENT_ON_MEME_ORDER, orderedMemeKeys);
                            this.convertor(firebaseMemes).then(memeLinkData => {
                                this.eventEmitter.emit(this.EVENT_ON_MEME, memeLinkData);
                                resolve(true);
                            });
                        }else{
                            resolve(true);
                            return;
                        }

                        //check if more memes needs to be loaded
                        if (Object.keys(memesVal).length != 0) {
                            this.loadMore(limit - orderedMemeKeys.length);//TODO find a better system to load type fresh and hot
                        }
                    }, this.type, this.userid, limit, this.lastPostDate);
                })
            }
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