import * as EventEmitter from "eventemitter3/index";
import {audit} from "./Audit";

export class BackService {
    eventEmitter = new EventEmitter();
    backCallBack = () => {
        audit.reportError("no callback set")
    };
    backAvailable: boolean;

    notifyBack() {
        this.eventEmitter.emit("back_event", {});
    }

    onBack(callback: () => void): () => void {
        this.eventEmitter.on("back_event", callback);
        return () => {
            this.eventEmitter.off("back_event", callback);
        }
    }

    notifyBackAvailable(state: boolean) {
        this.backAvailable = state;
        this.eventEmitter.emit("back_available_event", this.backAvailable);
    }

    onBackAvailable(callback: (state:boolean) => void): () => void {
        this.eventEmitter.on("back_available_event", callback);
        return () => {
            this.eventEmitter.off("back_available_event", callback);
        }
    }

    isBackAvailable(): boolean {
        return this.backAvailable;
    }

    goBack() {
        this.backCallBack();
    }

    setRequestBackCalback(callback: () => void): void {
        this.backCallBack = callback;
    }
}

export let backService = new BackService();