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
import {DATABASE_HOTS, DATABASE_MEMES, FirebaseMeme} from "./shared/FireBaseDBDefinition";

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

        //(6) compute meme hotness and meme value
        let hot;
        promiseArray.push(new Promise<boolean>((resolve2) => {
            firebase.database().ref(DATABASE_HOTS + "/" + meme.memeIpfsHash).once("value", (meme) => {
                meme = meme.val();
                hot = meme!=null;
                resolve2(true);
            });
        }));

        //(7) compute comment number
        let commentNumber=500;

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
                order:-meme.created,
                hot:hot
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


    constructor(public type:string,public tags:string[]) {
    }

    loadMore(limit: number) {
    }

    dataBase = DATABASE_MEMES;

    onFirebaseFresh(callback: (memes: { [id: string]: FirebaseMeme }) => void): () => void {
        let ref = firebase.database().ref(this.dataBase);
        let toremove = ref.on("value", (memes) => {
            if (memes == null) {
                console.error(memes);
                return;
            }
            let memesValue: { [id: string]: FirebaseMeme } = memes.val() || {};
            callback(memesValue);
        }, (errorObject) => {
            console.log("The read failed: " + errorObject.code);
        });
        //return remove listener function
        return () => {
            ref.off("value", toremove);
        };
    }

    onFirebaseHot(callback: (memes: { [id: string]: FirebaseMeme }) => void): () => void {
        let db = firebase.database();
        let toremove = db.ref(DATABASE_HOTS).on("value", (hots) => {
            if (hots == null) {
                console.error(hots);
                return;
            }
            let hotsList = hots.val() || {};
            hotsList = Object.keys(hotsList);
            hotsList.forEach( hotMeme => {
                //read the hot meme
                db.ref(DATABASE_MEMES+"/"+hotMeme).once("value",(memes) => {
                    if (memes == null) {
                        console.error(memes);
                        return;
                    }
                    let memesValue: FirebaseMeme = memes.val() || {};
                    let ret = {};
                    ret[memesValue.memeIpfsHash] = memesValue;
                    callback(ret);
                });
            });
        }, (errorObject) => {
            console.log("The read failed: " + errorObject.code);
        });
        return () => {
            db.ref(DATABASE_HOTS).off("value", toremove);
        };
    }

    on(callback: (memes: MemeLinkInterface[]) => void): () => void {
        let convertor = (memes) => {
            let memesPromise: Promise<Meme>[] = [];
            Object.keys(memes).forEach(memeID => {
                let meme:FirebaseMeme = memes[memeID];
                memesPromise.push(loadMeme(meme));
            });
            Q.all(memesPromise).then(memes => {
                let memeLinkData:MemeLinkInterface[] = [];
                memes.forEach((value:Meme) => {
                    let memeLink = new MemeLink(value.id,value.order);
                    memeLink.setMeme(value);
                    memeLinkData.push(memeLink);
                });
                callback(memeLinkData);
            });
        };
        if(this.type===MEME_TYPE_HOT){
            return this.onFirebaseHot(convertor);
        }else if(this.type===MEME_TYPE_FRESH){
            return this.onFirebaseFresh(convertor);
        }else{
            console.error("invalid meme loader type");
            return this.onFirebaseFresh(convertor);
        }
    }

    refresh() {
    }

}

export let firebaseMemeService = new FirebaseMemeService();
