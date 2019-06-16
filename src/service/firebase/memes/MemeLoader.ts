import {
    MemeLinkInterface,
    MemeLoaderInterface,
} from "../../generic/ApplicationInterface";
import EventEmitter from "eventemitter3";
import {MemeDBEntry} from "../../database/shared/DBDefinition";
import {audit} from "../../log/Audit";
import {firebaseMemeService} from "./FirebaseMemeService";
import {MemeLink} from "./MemeLink";
import {loadMeme} from "./MemeLoaderFunction";
import {memeDatabase} from "../../database/MemeDatabase";
import {report} from "../../log/Report";
import {deviceDetector} from "../../mobile/DeviceDetector";
import {IdleTaskPoolExecutor} from "../../concurency/IdleTaskPoolExecutor";
import Bottleneck from "bottleneck";
import {MEME_TYPE_HOT} from "../../generic/Meme";

export class MemeLoader implements MemeLoaderInterface {
    readonly EVENT_ON_MEME_DATA = "onMemeData";
    readonly EVENT_ON_MEME_ORDER = "onMemeOrder";
    readonly EVENT_ON_INITIAL_LOADING_FINISHED = "onInitialLoadingFinished";
    eventEmitter = new EventEmitter();
    lastPostDate: number = new Date().getTime();
    private poolMemeLoaderOrder: IdleTaskPoolExecutor;
    limiter = new Bottleneck({
        maxConcurrent: 10,
        minTime: 5,
    });


    constructor(public type: string, public tags: string[], public userid: string) {
        this.poolMemeLoaderOrder = new IdleTaskPoolExecutor(true);
    }

    loadMore(limit: number): void {
        this.poolMemeLoaderOrder.addResolvableTask((resolve, reject) => {
            if (limit < 0) {
                resolve(true);
                audit.reportError("negative limit");
            }
            if (limit <= 0) {
                resolve(true);
                return;
            }

            memeDatabase.fetchMemes(this.type, this.userid, limit, this.lastPostDate).then((memes: MemeDBEntry[]) => {
                // filter flaged content
                memes = memes.filter(meme => {
                    let hash = meme.memeIpfsHash;
                    let localReportContent: boolean = !!report.getReportedContent("meme")[hash]
                    let localReportUser: boolean = !!report.getReportedContent("user")[meme.uid];
                    let distantReportContent = meme.flag;
                    if (deviceDetector.isMobileAppRender()) {
                        distantReportContent = distantReportContent || meme.flagMobile;
                    }
                    //TODO distant reported user
                    let flag = localReportContent || distantReportContent || localReportUser;
                    return !flag;
                });

                //orderer meme keys
                let orderedMemeKeys: string[] = [];
                memes.forEach(fireBaseMeme => {
                    if(this.type===MEME_TYPE_HOT){
                        this.lastPostDate = fireBaseMeme.hot;
                    }else{
                        this.lastPostDate = fireBaseMeme.created;
                    }
                    let hash = fireBaseMeme.memeIpfsHash;
                    orderedMemeKeys.push(hash);
                });
                //notify memes
                memes = memes.filter(meme => {
                    return orderedMemeKeys.indexOf(meme.memeIpfsHash) >= 0;
                });

                if (orderedMemeKeys.length > 0) {
                    //notify memes
                    this.eventEmitter.emit(this.EVENT_ON_MEME_ORDER, orderedMemeKeys);

                    //notify meme data
                    this.convertorV2(memes).then(memeLinks => {
                        memeLinks.forEach(memeLink => {
                            this.eventEmitter.emit(this.EVENT_ON_MEME_DATA, memeLink);
                        });
                        resolve(true);
                    });

                } else {
                    resolve(true);
                    return;
                }

            }).catch(reason => {
                reject(reason);
            });
        });
    }

    private convertorV2(memes: MemeDBEntry[]): Promise<MemeLinkInterface[]> {
        return new Promise<MemeLinkInterface[]>((resolve, reject) => {
            let memeLinkData: MemeLinkInterface[] = [];
            Object.keys(memes).forEach(memeID => {
                let meme: MemeDBEntry = memes[memeID];
                let memeLink = firebaseMemeService.getMemeLink(meme.memeIpfsHash);
                memeLinkData.push(memeLink);
                //lazy load meme
                this.limiter.schedule(() => new Promise((resolve, reject) => {
                    let promise = loadMeme(meme);
                    promise.then(convertedMeme => {
                        let memeLink = firebaseMemeService.getMemeLink(convertedMeme.id);
                        (memeLink as MemeLink).setMeme(convertedMeme);
                        resolve("true");
                    }).catch(reason => {
                        reject(reason);
                    });
                }));
            });
            resolve(memeLinkData);
        })
    };

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