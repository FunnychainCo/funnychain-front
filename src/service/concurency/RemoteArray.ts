import EventEmitter from "eventemitter3";

export class RemoteArray<T> {
    private eventEmitter = new EventEmitter();
    private cache: T[] = [];
    private loadDataCallback: () => void = () => {
    };


    setLoadDataCallback(loadMoreCallback: () => void) {
        this.loadDataCallback = loadMoreCallback;
    }

    addOrUpdateToList(data: { index: number, data: T }) {
        if (data.index < this.cache.length) {
            this.eventEmitter.emit("updateEntry", data);
        } else if (data.index == this.cache.length) {
            this.eventEmitter.emit("addEntry", data);
        } else {
            throw new Error("invalid index " + data.index)
        }
    }

    refresh(): void {
        this.loadDataCallback();
    }

    getLocalValue(): T[] {
        return this.cache;
    }

    onAdd(callbackAdd: (data: { index: number, data: T }) => void, history: boolean): () => void {
        this.eventEmitter.on("addEntry", callbackAdd);
        if (history) {
            this.resync(callbackAdd);
        }
        return () => {
            this.eventEmitter.off("addEntry", callbackAdd);
        };
    }

    onUpdate(callbackUpdate: (data: { index: number, data: T }) => void): () => void {
        this.eventEmitter.on("updateEntry", callbackUpdate);
        return () => {
            this.eventEmitter.off("updateEntry", callbackUpdate);
        };
    }

    private resync(callbackAdd: (data: { index: number, data: T }) => void) {
        this.cache.forEach((value, index) => {
            callbackAdd({index: index, data: value});
        })
    }
}
