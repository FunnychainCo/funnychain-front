import {CommentsVisitor, MemeLinkInterface} from "../generic/ApplicationInterface";
import * as dsteem from "dsteem";
import {steemConnectAuthService} from "./steemConnect/SteemConnectAuthService";
import * as EventEmitter from "eventemitter3";
import {convertMeme} from "./generic/SteemUtils";
import {Meme, MEME_ENTRY_NO_VALUE} from "../generic/Meme";
import {steemCommentService} from "./SteemCommentsService";

export class MemeLink implements MemeLinkInterface {
    private eventEmitter = new EventEmitter();
    private dSteemClient: dsteem.Client;
    private lastValidMeme:Meme = MEME_ENTRY_NO_VALUE;
    commentVisitor:CommentsVisitor;

    constructor(public id: string) {
        this.dSteemClient = steemConnectAuthService.dSteemClient;
        this.commentVisitor = steemCommentService.getCommentVisitor(id);
    }

    getCommentVisitor():CommentsVisitor{
        return this.commentVisitor;
    }

    setMeme(meme:Meme){
        this.lastValidMeme = meme;
    }

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
        return new Promise(resolve => {
            this.dSteemClient.database.getState(this.id).then(value => {
                let subId = this.id.split("@")[1];
                let promise = convertMeme(value.content[subId]);
                promise.then(convertedMeme => {
                    this.lastValidMeme = convertedMeme;
                    this.eventEmitter.emit("onSingleMeme", convertedMeme);
                    resolve("ok");
                });
            });
        });
    }

}