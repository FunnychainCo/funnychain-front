import * as EventEmitter from "eventemitter3/index";
import {audit} from "./Audit";

export class BackService {
    eventEmitter = new EventEmitter();
    backCallBack = ()=>{audit.reportError("no callback set")}

    notifyBack(){
        this.eventEmitter.emit("back_event",{});
    }

    onBack(callback:()=>void):()=>void{
        this.eventEmitter.on("back_event",callback);
        return ()=>{
            this.eventEmitter.off("back_event",callback);
        }
    }

    goBack(){
        this.backCallBack();
    }

    setRequestBackCalback(callback:()=>void):void{
        this.backCallBack = callback;
    }
}

export let backService = new BackService();