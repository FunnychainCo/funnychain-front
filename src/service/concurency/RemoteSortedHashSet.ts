import EventEmitter from "eventemitter3";

export class RemoteSortedHashSet<T> {
    private eventEmitter = new EventEmitter();
    private itemOrder: string[] = [];
    private data: { [id: string]: T } = {};
    private loadDataCallback: () => void = () => {
    };
    private sortFunction: (a: T, b: T) => number = ()=>{return 0};


    setLoadDataCallback(loadMoreCallback: () => void) {
        this.loadDataCallback = loadMoreCallback;
    }

    setSortFunction(sortFunction:(a:T,b:T)=>number):void{
        this.sortFunction = sortFunction;
    }

    addOrUpdateToList(data: {hash: string, data: T }) {
        //insert new item
        if(this.itemOrder.indexOf(data.hash)<0){
            this.itemOrder.push(data.hash);
        }
        //insert or update data
        this.data[data.hash]=data.data;
        this.eventEmitter.emit("onData", { hash: data.hash, data: data.data });//data update
        //sort
        this.itemOrder.sort((a, b) => {
            return this.sortFunction(this.data[a],this.data[b]);
        });
        //notify update
        this.eventEmitter.emit("onIndex", this.itemOrder);//index update
    }

    refresh(): void {
        this.loadDataCallback();
    }

    onIndex(callback: (data: string[]) => void): () => void {
        this.eventEmitter.on("onIndex", callback);
        return () => {
            this.eventEmitter.off("onIndex", callback);
        };
    }

    onDataUpdate(callback: (data: { hash: string, data: T }) => void): () => void {
        this.eventEmitter.on("onData", callback);
        return () => {
            this.eventEmitter.off("onData", callback);
        };
    }

    triggerHistory(){
        Object.keys(this.data).forEach((key) => {
            this.eventEmitter.emit("onData", { hash: key, data: this.data[key] });
        });
        this.eventEmitter.emit("onIndex", this.itemOrder);
    }

}
