import * as EventEmitter from "eventemitter3/index";

export class BackService {
    eventEmitter = new EventEmitter();

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
        this.eventEmitter.emit("request_back",{});
    }

    onRequestBack(callback:()=>void):()=>void{
        this.eventEmitter.on("request_back",callback);
        return ()=>{
            this.eventEmitter.off("request_back",callback);
        }
    }
}

export let backService = new BackService();