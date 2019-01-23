import * as firebase from 'firebase';
import {
    MemeLinkInterface,
    MemeLoaderInterface,
} from "../../generic/ApplicationInterface";
import * as Q from 'q';
import {Meme} from "../../generic/Meme";
import * as EventEmitter from "eventemitter3";
import {DATABASE_CACHE_USERS, DATABASE_MEMES, FirebaseMeme, FirebaseMemeDBStruct} from "../shared/FireBaseDBDefinition";
import {PromisePoolExecutor} from "promise-pool-executor";
import {audit} from "../../Audit";
import {firebaseMemeService} from "../FirebaseMemeService";
import {MemeLink} from "./MemeLink";
import {loadMeme} from "./MemeLoaderFunction";

export class MemeByUserLoader implements MemeLoaderInterface{

    readonly EVENT_ON_MEME = "onMeme";
    readonly EVENT_ON_MEME_DATA = "onMemeData";
    readonly EVENT_ON_MEME_ORDER = "onMemeOrder";
    readonly EVENT_ON_INITIAL_LOADING_FINISHED = "onInitialLoadingFinished";
    lastPostDate: number = new Date().getTime();
    alreadyProvided: number = 0;
    eventEmitter = new EventEmitter();
    private pool: PromisePoolExecutor;


    constructor(public userid:string) {
        this.pool = new PromisePoolExecutor(1);//concurrency limit of 1
    }

    loadMore(limit: number):void {
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
                    let ref = firebase.database().ref(DATABASE_CACHE_USERS+"/"+this.userid+"/memes");
                    let memes = new Promise(resolveMemes => {
                        ref.once("value", (memes) => {
                            let promiseList:Promise<any>[] = [];
                            let memesVal: FirebaseMemeDBStruct = memes.val() || {};
                            Object.keys(memesVal).forEach(memekey => {
                                promiseList.push(new Promise<any>(resolveMeme => {
                                    firebase.database().ref(DATABASE_MEMES + "/" + memekey).once("value", (meme) => {
                                        let memeVal: FirebaseMemeDBStruct = meme.val() || {};
                                        resolveMeme(memeVal);
                                    });
                                }));
                            });
                            Promise.all(promiseList).then(value => {
                                resolveMemes(value);
                            });
                        });
                    });
                    memes.then( (memesVal) => {
                        let firebaseMemes: FirebaseMeme[] = [];
                        Object.keys(memesVal).forEach(key => {
                            let memeVal:FirebaseMeme = memesVal[key];
                            if (this.userid === memeVal.uid) {
                                firebaseMemes.push(memeVal);
                            }
                        });
                        //sort meme by creation time
                        firebaseMemes.sort((a, b) => {
                            return a.created - b.created;
                        });
                        let orderedMemeKeys: string[] = [];
                        firebaseMemes.forEach(fireBaseMeme => {
                            orderedMemeKeys.push(fireBaseMeme.memeIpfsHash);
                        });

                        orderedMemeKeys = orderedMemeKeys.slice(this.alreadyProvided,limit);
                        this.alreadyProvided+=orderedMemeKeys.length;
                        if(orderedMemeKeys.length==0){
                            this.eventEmitter.emit(this.EVENT_ON_INITIAL_LOADING_FINISHED, {});
                        }

                        if (orderedMemeKeys.length > 0) {
                            this.eventEmitter.emit(this.EVENT_ON_MEME_ORDER, orderedMemeKeys);
                        }
                        this.convertor(firebaseMemes).then(memeLinkData => {
                            this.eventEmitter.emit(this.EVENT_ON_MEME, memeLinkData);
                            resolve(true);
                            if (Object.keys(memesVal).length != 0) {
                                this.loadMore(limit - firebaseMemes.length);//TODO find a better system to load type fresh and hot
                            }
                        });
                    });
                })
            }
        });
    }

    private convertor(memes:FirebaseMeme[]):Promise<MemeLinkInterface[]> {
        return new Promise<MemeLinkInterface[]>(resolve => {
            let memesPromise: Promise<Meme>[] = [];
            Object.keys(memes).forEach(memeID => {
                let meme: FirebaseMeme = memes[memeID];
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
    onMemeData(callback: (meme: MemeLinkInterface) => void): () => void{
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
    onMemeOrder(callback: (memesId: string[]) => void): () => void{
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
        this.lastPostDate=new Date().getTime();
        this.alreadyProvided = 0;
    }

}