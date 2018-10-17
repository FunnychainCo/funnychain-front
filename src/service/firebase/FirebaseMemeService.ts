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

export class FirebaseMemeService implements MemeServiceInterface {
    getMemeLink(id: string, order: number): MemeLinkInterface {
        return new MemeLink(id,order);
    }
    getMemeLoader(type: string, tags: string[]): MemeLoaderInterface {
        return new MemeLoader(type,tags);
    }

}

function loadMeme(meme:FirebaseMeme):Promise<Meme>{
    return new Promise<Meme>((resolve, reject) => {
        let memeIPFSLink = ipfsFileUploadService.convertIPFSHashToIPFSLink(meme.memeIpfsHash);
        let promiseArray:Promise<boolean>[] = [];

        //(1) retreive IPFS meme and load its image data
        let ipfsMeme:IPFSMeme;
        let imgUrl;
        promiseArray.push(new Promise<boolean>((resolve2) => {
            axios.get(memeIPFSLink, {responseType: 'arraybuffer'}).then((response) => {
                ipfsMeme = JSON.parse(new Buffer(response.data, 'binary').toString());
                preLoadImage(ipfsFileUploadService.convertIPFSHashToIPFSLink(ipfsMeme.imageIPFSHash)).then((imgUrlValue:string) => {
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
        let currentUserBet;
        promiseArray.push(new Promise<boolean>((resolve2) => {
            authService.getLoggedUser().then(currentUserData => {
                firebaseBetService.hasBetOnPost(meme.memeIpfsHash, currentUserData.uid).then(currentUserBetValue => {
                    currentUserBet=currentUserBetValue;
                    resolve2(true);
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
                order:-meme.created,
                hot:meme.hot
            });
        })
    });
}

class MemeLink implements MemeLinkInterface{
    id: string;
    order: number;
    private commentVisitor: CommentsVisitor;
    private lastValidMeme:Meme = MEME_ENTRY_NO_VALUE;
    private eventEmitter = new EventEmitter();

    constructor(id: string, order: number) {
        this.id = id;
        this.order = order;
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
                    console.error(memes);
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
    eventEmitter = new EventEmitter();
    lastPostDate: number = new Date().getTime();

    constructor(public type:string,public tags:string[]) {
    }

    loadMore(limit: number):void {
        if(limit<0){
            console.error("negative limit");
        }
        if(limit<=0){
            return;
        }
        let ref = firebase.database().ref(DATABASE_MEMES).orderByChild('created')
            .endAt(this.lastPostDate-1)
            .limitToLast(limit);
        ref.once("value",(memes)=> {
            let memesVal: FirebaseMemeDBStruct = memes.val() || {};
            let firebaseMemes:FirebaseMeme[] = [];
            Object.keys(memesVal).forEach(key => {
                let memeVal = memesVal[key];
                if(this.lastPostDate>memeVal.created){
                    this.lastPostDate = memeVal.created;
                }
                if(this.type==MEME_TYPE_HOT && memeVal.hot){
                    firebaseMemes.push(memeVal);
                }
                if(this.type==MEME_TYPE_FRESH && !memeVal.hot){
                    firebaseMemes.push(memeVal);
                }
            });
            //sort meme by creation time
            firebaseMemes.sort((a, b) => {
                return a.created - b.created;
            });
            this.convertor(firebaseMemes).then(memeLinkData => {
                this.eventEmitter.emit(this.EVENT_ON_MEME, memeLinkData);
                this.loadMore(limit-firebaseMemes.length);//TODO find a better system to load type fresh and hot
            });
        });

    }

    onFirebase(hot:boolean,callback: (memes: { [id: string]: FirebaseMeme }) => void): () => void {
        let ref = firebase.database().ref(DATABASE_MEMES).orderByChild('created').limitToFirst(2);
        let toremove = ref.on("child_added", (meme) => {
            if (meme == null) {
                console.error(meme);
                return;
            }
            let memeValue: FirebaseMeme = meme.val() || {};
            let ret = {};
            ret[memeValue.memeIpfsHash] = memeValue;
            callback(ret);
        }, (errorObject) => {
            console.log("The read failed: " + errorObject.code);
        });
        //return remove listener function
        return () => {
            ref.off("value", toremove);
        };
    }

    private convertor(memes:FirebaseMeme[]):Promise<MemeLinkInterface[]> {
        return new Promise<MemeLinkInterface[]>(resolve => {
            let memesPromise: Promise<Meme>[] = [];
            Object.keys(memes).forEach(memeID => {
                let meme: FirebaseMeme = memes[memeID];
                memesPromise.push(loadMeme(meme));
            });
            Q.all(memesPromise).then(memes => {
                let memeLinkData: MemeLinkInterface[] = [];
                memes.forEach((value: Meme) => {
                    let memeLink = new MemeLink(value.id, value.order);
                    memeLink.setMeme(value);
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

    refresh() {
        this.lastPostDate=0;
    }

}

export let firebaseMemeService = new FirebaseMemeService();
