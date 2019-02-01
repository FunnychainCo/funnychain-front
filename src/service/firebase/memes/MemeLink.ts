import * as firebase from 'firebase';
import {
    CommentsVisitor,
    MemeLinkInterface,
} from "../../generic/ApplicationInterface";
import {Meme, MEME_ENTRY_NO_VALUE} from "../../generic/Meme";
import {firebaseCommentService} from "../FirebaseCommentService";
import EventEmitter from "eventemitter3";
import {DATABASE_MEMES, FirebaseMeme} from "../shared/FireBaseDBDefinition";
import {audit} from "../../Audit";
import {loadMeme} from "./MemeLoaderFunction";

export class MemeLink implements MemeLinkInterface{
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