import EventEmitter from "eventemitter3";

export class RemoteHashMap<T> {

    private eventEmitter = new EventEmitter();
    private cache: { [id: string]: T } = {};
    private resync: (callback: (data:{ [id: string]: T }) => void) => void = (callback)=>{callback({});};

    constructor() {

    }

    setResync(resync: (callback: (data:{ [id: string]: T }) => void) => void){
        this.resync = resync;
    }

    setAddEventNotifier(runnable: (callback: (data:{hash:string,entry: T}) => void) => void){
        runnable((data:{hash:string,entry: T}) => {
            this.eventEmitter.emit("addEntry", data);
        });
    }

    setRemoveEventNotifier(runnable: (callback: (hash:string) => void) => void){
        runnable((hash:string) => {
            this.eventEmitter.emit("removeEntry", hash);
        });
    }

    refresh() {
        this.resyncWithCache(data => {
            this.eventEmitter.emit("addEntry", data);
        },hash => {
            this.eventEmitter.emit("removeEntry", hash);
        },data => {
            this.eventEmitter.emit("updateEntry", data);
        },true);
    }

    private resyncWithCache(
        callbackAdd: (data:{hash:string,entry: T}) => void,
        callbackRemove: (hash:string) => void,
        callbackUpdate: (data:{hash:string,entry: T}) => void,
        resetCache:boolean,
    ):void{
        // second we send remote status as patch
        this.resync(resyncData => {
            if(resetCache){
                this.cache={};
            }
            //remove
            Object.keys(this.cache).forEach(key => {
                if(!resyncData[key]){
                    delete this.cache[key];
                    callbackRemove(key);
                }
            });
            //add
            Object.keys(resyncData).forEach(key => {
                if(!this.cache[key]){
                    this.cache[key]=resyncData[key];
                    callbackAdd({
                        hash:key,
                        entry:this.cache[key]
                    });
                }
            });
            //update
            Object.keys(resyncData).forEach(key => {
                if(JSON.stringify(this.cache[key])!==JSON.stringify(resyncData[key])){
                    this.cache[key]=resyncData[key];
                    callbackUpdate({
                        hash:key,
                        entry:this.cache[key]
                    });
                }
            });
        });
        if(!resetCache) {
            //first we send local status
            Object.keys(this.cache).forEach(key => {
                callbackAdd({
                    hash: key,
                    entry: this.cache[key]
                });
            });
        }
    }

    getLocalValue():{ [id: string]: T }{
        return this.cache;
    }

    onEntry(
        callbackAdd: (data:{hash:string,entry: T}) => void,
        callbackRemove: (hash:string) => void,
        callbackUpdate: (data:{hash:string,entry: T}) => void,
    ): () => void {
        this.eventEmitter.on("addEntry", callbackAdd);
        this.eventEmitter.on("removeEntry", callbackRemove);
        this.eventEmitter.on("updateEntry", callbackUpdate);
        this.resyncWithCache(callbackAdd,callbackRemove,callbackUpdate,false);
        return () => {
            this.eventEmitter.off("addEntry", callbackAdd);
            this.eventEmitter.off("removeEntry", callbackRemove);
            this.eventEmitter.off("updateEntry", callbackUpdate);
        };
    }

}