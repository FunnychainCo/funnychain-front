import * as firebase from 'firebase';
import {
    CommentsVisitor,
    MemeLinkInterface,
    MemeLoaderInterface,
    MemeServiceInterface
} from "../generic/ApplicationInterface";
import * as Q from 'q';
import {UserEntry} from "../generic/UserEntry";
import {IPFSMeme, Meme, MEME_ENTRY_NO_VALUE, MEME_TYPE_FRESH, MEME_TYPE_HOT} from "../generic/Meme";
import axios from 'axios'
import {ipfsFileUploadService} from "../IPFSFileUploader/IPFSFileUploadService";
import {userService} from "../generic/UserService";
import {preLoadImage} from "../ImageUtil";
import {firebaseCommentService} from "./FirebaseCommentService";
import * as EventEmitter from "eventemitter3";
import {firebaseUpvoteService} from "./FirebaseUpvoteService";
import {authService} from 'src/service/generic/AuthService';
import {DATABASE_MEMES, FirebaseMeme, FirebaseMemeDBStruct} from "./shared/FireBaseDBDefinition";
import {firebaseBetService} from "./FirebaseBetService";
import {PromisePoolExecutor} from "promise-pool-executor";
import {audit} from "../Audit";

export class FirebaseMemeService implements MemeServiceInterface {

    memeLinkCache: { [id: string]: MemeLink; } = {};

    getMemeLink(id: string): MemeLinkInterface {
        if (this.memeLinkCache[id] == undefined) {
            this.memeLinkCache[id] = new MemeLink(id);
        }
        return this.memeLinkCache[id];
    }

    getMemeLoader(type: string, tags: string[]): MemeLoaderInterface {
        return new MemeLoader(type,tags);
    }

}

function loadMeme(meme:FirebaseMeme):Promise<Meme>{
    return new Promise<Meme>((resolve, reject) => {
        let memeIPFSLink = ipfsFileUploadService.convertIPFSLinkToHttpsLink(meme.memeIpfsHash);
        let promiseArray:Promise<boolean>[] = [];

        //(1) retreive IPFS meme and load its image data
        let ipfsMeme:IPFSMeme;
        let imgUrl;
        promiseArray.push(new Promise<boolean>((resolve2) => {
            axios.get(memeIPFSLink, {responseType: 'arraybuffer'}).then((response) => {
                ipfsMeme = JSON.parse(new Buffer(response.data, 'binary').toString());
                preLoadImage(ipfsFileUploadService.convertIPFSLinkToHttpsLink(ipfsMeme.imageIPFSHash)).then((imgUrlValue:string) => {
                    imgUrl = imgUrlValue;
                    resolve2(true);
                });
            });
        }));

        //(2) compute if current user voted
        let currentUserVoted;
        promiseArray.push(new Promise<boolean>((resolve2) => {
            authService.getLoggedUser().then(currentUserData => {
                firebaseUpvoteService.hasVotedOnPost(meme.memeIpfsHash, currentUserData.uid).then(currentUserVotedValue => {
                    currentUserVoted=currentUserVotedValue;
                    resolve2(true);
                });
            });
        }));

        //(2.5) compute if current user bet
        //(6) is meme bettable
        let bettable = false;
        let currentUserBet;
        promiseArray.push(new Promise<boolean>((resolve2) => {
            authService.getLoggedUser().then(currentUserData => {
                firebaseBetService.isBetEnableOnPost(meme.memeIpfsHash).then(bettableRes => {
                    firebaseBetService.hasBetOnPost(meme.memeIpfsHash, currentUserData.uid).then(currentUserBetValue => {
                        currentUserBet=currentUserBetValue;
                        bettable = currentUserData.wallet >= 1.0 && bettableRes;
                        resolve2(true);
                    });
                });
            });
        }));

        //(3) compute number of vote
        let voteNumber;
        promiseArray.push(new Promise<boolean>((resolve2) => {
            firebaseUpvoteService.countVote(meme.memeIpfsHash).then(voteNumberValue => {
                voteNumber=voteNumberValue;
                resolve2(true);
            });
        }));

        //(4) retreive author data
        let userValue;
        promiseArray.push(new Promise<boolean>((resolve2) => {
            userService.loadUserData(meme.uid).then((userValueValue: UserEntry) => {
                userValue=userValueValue;
                resolve2(true);
            });
        }));


        //(7) compute comment number
        let commentNumber=0;
        promiseArray.push(new Promise<boolean>((resolve2) => {
            firebaseCommentService.getCommentNumber(meme.memeIpfsHash).then( (nb:number) =>{
                commentNumber=nb;
                resolve2(true);
            });
        }));

        //resolve the meme
        Promise.all(promiseArray).then(value => {
            resolve({
                id: meme.memeIpfsHash,
                title: ipfsMeme.title,
                imageUrl: imgUrl,
                created: new Date(meme.created),
                user: userValue,
                dolarValue: meme.value?meme.value:0,
                commentNumber: commentNumber,
                voteNumber: voteNumber,
                currentUserVoted: currentUserVoted,
                currentUserBet:currentUserBet,
                hot:meme.hot!=0,
                hotDate:new Date(meme.hot),
                bettable:bettable
            });
        })
    });
}

class MemeLink implements MemeLinkInterface{
    id: string;
    private commentVisitor: CommentsVisitor;
    private lastValidMeme:Meme = MEME_ENTRY_NO_VALUE;
    private eventEmitter = new EventEmitter();

    constructor(id: string) {
        this.id = id;
        this.commentVisitor = firebaseCommentService.getCommentVisitor(this.id);
    }

    //TODO should be once => on has no meaning on meme data (except upvote and comments)
    on(callback: (meme: Meme) => void): () => void {
        this.eventEmitter.on("onSingleMeme", callback);
        this.refresh();//initial call
        return () => {
            this.eventEmitter.off("onSingleMeme", callback);
        };
    }

    refresh(): Promise<string> {
        if(this.lastValidMeme!==MEME_ENTRY_NO_VALUE) {
            this.eventEmitter.emit("onSingleMeme", this.lastValidMeme);
        }
        return new Promise<string>((resolve, reject) => {
            firebase.database().ref(DATABASE_MEMES + "/" + this.id).once("value", (memes) => {
                if (memes == null) {
                    audit.reportError(memes);
                    return;
                }
                let meme:FirebaseMeme = memes.val() || {};
                loadMeme(meme).then(meme => {
                    this.lastValidMeme = meme;
                    this.eventEmitter.emit("onSingleMeme", meme);
                    resolve("ok");
                });
            });
        });
    }

    getCommentVisitor(): CommentsVisitor {
        return this.commentVisitor;
    }

    setMeme(meme:Meme){
        this.lastValidMeme = meme;
    }
}

class MemeLoader implements MemeLoaderInterface{

    readonly EVENT_ON_MEME = "onMeme";
    readonly EVENT_ON_MEME_DATA = "onMemeData";
    readonly EVENT_ON_MEME_ORDER = "onMemeOrder";
    eventEmitter = new EventEmitter();
    lastPostDate: number = new Date().getTime();
    private pool: PromisePoolExecutor;


    constructor(public type:string,public tags:string[]) {
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
                    let hot = this.type == MEME_TYPE_HOT;
                    let ref = firebase.database().ref(DATABASE_MEMES).orderByChild(hot ? 'hot' : 'created')
                        .endAt(this.lastPostDate - 1)
                        .limitToLast(limit);
                    ref.once("value", (memes) => {
                        let memesVal: FirebaseMemeDBStruct = memes.val() || {};
                        let firebaseMemes: FirebaseMeme[] = [];
                        Object.keys(memesVal).forEach(key => {
                            let memeVal = memesVal[key];
                            if (this.lastPostDate > memeVal.created) {
                                this.lastPostDate = memeVal.created;
                            }
                            if (this.type == MEME_TYPE_HOT && memeVal.hot) {
                                firebaseMemes.push(memeVal);
                            }
                            if (this.type == MEME_TYPE_FRESH && !memeVal.hot) {
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
                        if (orderedMemeKeys.length > 0) {
                            this.eventEmitter.emit(this.EVENT_ON_MEME_ORDER, orderedMemeKeys);
                        }
                        this.convertor(firebaseMemes).then(memeLinkData => {
                            this.eventEmitter.emit(this.EVENT_ON_MEME, memeLinkData);
                            resolve(true);
                            if (firebaseMemes.length != 0) {
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

    refresh() {
        this.lastPostDate=new Date().getTime();
    }

}

export let firebaseMemeService = new FirebaseMemeService();
