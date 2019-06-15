import {promiseTimeout} from "./TimeoutPromise";

declare let window: any;

export class IdleTaskPoolExecutor {

    starter: () => void;
    lastPromise: Promise<any>;
    cancelHandle: { [id: string]: { [id: string]: boolean } } = {};

    constructor(private idleMode = true,private timeout = 20000) {
        this.lastPromise = new Promise(resolve => {
            this.starter = resolve;
        });
        if (typeof (window) !== 'undefined' && window.requestIdleCallback && this.idleMode) {
            window.requestIdleCallback(() => {
                this.starter();
            });
        } else {
            this.starter();
        }
    }

    addTask(task: () => void, globalCancelID?: string): Promise<any> {
        globalCancelID = globalCancelID ? globalCancelID : "global";

        this.lastPromise = this.lastPromise.then(() => {
            return promiseTimeout(new Promise((resolve, reject) => {
                if (typeof (window) !== 'undefined' && window.requestIdleCallback && this.idleMode) {
                    let requestIdleHandle = window.requestIdleCallback(() => {
                        delete this.cancelHandle[globalCancelID][requestIdleHandle];
                        task();
                    });
                    if (!this.cancelHandle[globalCancelID]) {
                        this.cancelHandle[globalCancelID] = {};
                    }
                    this.cancelHandle[globalCancelID][requestIdleHandle] = true;
                } else {
                    task();
                }
            }), this.timeout);
        });
        return this.lastPromise;
    }

    cancelGroup(globalCancelID: string) {
        if (typeof (window) !== 'undefined' && window.requestIdleCallback && this.idleMode) {
            if (!this.cancelHandle[globalCancelID]) {
                this.cancelHandle[globalCancelID] = {};
            }
            let group = this.cancelHandle[globalCancelID];
            Object.keys(group).forEach(handle => {
                window.cancelIdleCallback(handle);
            });
            delete this.cancelHandle[globalCancelID];
        }
    }

    addResolvableTask(task: (resolve: (data: any) => void, reject: (data: any) => void) => void): Promise<any> {
        this.lastPromise = this.lastPromise.then(() => {
            return promiseTimeout(new Promise((resolve, reject) => {
                if (typeof (window) !== 'undefined' && window.requestIdleCallback && this.idleMode) {
                    window.requestIdleCallback(() => {
                        task(resolve, reject);
                    });
                } else {
                    task(resolve, reject);
                }
            }), this.timeout);
        });
        return this.lastPromise;
    }

}