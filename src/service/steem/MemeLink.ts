import {MemeLinkInterface} from "../generic/ApplicationInterface";
import * as dsteem from "dsteem";
import {steemAuthService} from "./SteemAuthService";
import * as EventEmitter from "eventemitter3";
import {convertMeme} from "./SteemUtils";
import {Meme, MEME_ENTRY_NO_VALUE} from "../generic/Meme";

export class MemeLink implements MemeLinkInterface {
    private eventEmitter = new EventEmitter();
    private dSteemClient: dsteem.Client;
    private lastValidMeme:Meme = MEME_ENTRY_NO_VALUE;

    constructor(public id: string) {
        this.dSteemClient = steemAuthService.dSteemClient;
    }

    on(callback: (meme: Meme) => void): () => void {
        this.eventEmitter.on("onSingleMeme", callback);
        this.refresh();//initial call
        return () => {
            this.eventEmitter.off("onSingleMeme", callback);
        };
    }



    refresh(): Promise<any> {
        if(this.lastValidMeme!==MEME_ENTRY_NO_VALUE) {
            this.eventEmitter.emit("onSingleMeme", this.lastValidMeme);
        }
        return new Promise(resolve => {
            this.dSteemClient.database.getState(this.id).then(value => {
                let subId = this.id.split("@")[1];
                let promise = convertMeme(value.content[subId],0);//TODO put the real value for order number
                promise.then(convertedMeme => {
                    this.lastValidMeme = convertedMeme;
                    this.eventEmitter.emit("onSingleMeme", convertedMeme);
                });
            });
        });
    }

}