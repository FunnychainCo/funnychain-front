import EventEmitter from "eventemitter3";

export class RemoteValue {

    private eventEmitter = new EventEmitter();
    private cache: any;
    private resync: (callback: (data:any) => void) => void = (callback)=>{callback(this.cache);};

    constructor(initValue:any) {
        this.cache=initValue;
    }

    setResync(resync: (callback: (data:any) => void) => void){
        this.resync = resync;
    }

    setModifyEventNotifier(runnable: (callback: (data:any) => void) => void){
        runnable((data:any) => {
            this.eventEmitter.emit("change", data);
        });
    }

    refresh(){
        this.resync(data => {
            if(this.cache!==data){
                this.cache=data;
                this.eventEmitter.emit("change", data);
            }
        })
    }

    onChange(callback: (data:any) => void): () => void {
        this.eventEmitter.on("change", callback);
        callback(this.cache);
        this.refresh();
        return () => {
            this.eventEmitter.off("change", callback);
        };
    }

}