import {MemeLinkInterface} from "../generic/ApplicationInterface";
import * as dsteem from "dsteem";
import {steemAuthService} from "./SteemAuthService";
import * as EventEmitter from "eventemitter3";
import {convertMeme} from "./SteemUtils";
import {Meme} from "../generic/Meme";

export class MemeLink implements MemeLinkInterface {
    eventEmitter = new EventEmitter();
    private dSteemClient: dsteem.Client;

    constructor(public id: string) {
        this.dSteemClient = steemAuthService.dSteemClient;
    }

    on(callback: (meme: Meme) => void): () => void {
        this.eventEmitter.on("onSingleMeme", callback);
        return () => {
            this.eventEmitter.off("onSingleMeme", callback);
        };
    }

    refresh(): Promise<any> {
        return new Promise(resolve => {
            this.dSteemClient.database.getState(this.id).then(value => {
                let subId = this.id.split("@")[1];
                let promise = convertMeme(value.content[subId],0);//TODO put the real value for order number
                promise.then(convertedMeme => {
                    this.eventEmitter.emit("onSingleMeme", convertedMeme);
                });
            });
        });
    }

}