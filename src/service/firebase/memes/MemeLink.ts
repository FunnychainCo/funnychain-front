import {
    CommentsVisitor,
    MemeLinkInterface,
} from "../../generic/ApplicationInterface";
import {Meme, MEME_ENTRY_NO_VALUE} from "../../generic/Meme";
import {firebaseCommentService} from "../FirebaseCommentService";
import EventEmitter from "eventemitter3";
import {loadMeme} from "./MemeLoaderFunction";
import {memeDatabase} from "../../database/MemeDatabase";
import Bottleneck from "bottleneck";

export class MemeLink implements MemeLinkInterface{
    id: string;
    private commentVisitor: CommentsVisitor;
    private lastValidMeme:Meme = MEME_ENTRY_NO_VALUE;
    private eventEmitter = new EventEmitter();

    limiter = new Bottleneck({
        highWater:2,
        maxConcurrent: 1,
        minTime: 1000,
        strategy:Bottleneck.strategy.LEAK,
    });

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
        //lazy update meme
        return this.limiter.schedule(() => {
            return new Promise<any>((resolve, reject) => {
                memeDatabase.getMeme(this.id).then(meme => {
                    loadMeme(meme).then(meme => {
                        this.lastValidMeme = meme;
                        this.eventEmitter.emit("onSingleMeme", this.lastValidMeme);
                        resolve("ok");
                    }).catch(reason => {
                        reject(reason);
                    });
                }).catch(reason => {
                    reject(reason);
                });
            })
        }).catch(reason => {
            /* LeakStrategie do nothing */
        })
    }

    getCommentVisitor(): CommentsVisitor {
        return this.commentVisitor;
    }

    setMeme(meme:Meme){
        this.lastValidMeme = meme;
        this.eventEmitter.emit("onSingleMeme", this.lastValidMeme);
    }
}