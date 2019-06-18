import {promiseTimeout} from "./TimeoutPromise";

declare let window: any;

export class IdleTaskPoolExecutor {

    starter: () => void;
    lastPromise: Promise<any>;
    cancelHandle: { [id: string]: { [id: string]: boolean } } = {};

    constructor(private idleMode = true, private taskTimeOut = 20000) {
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


    private resolveTaskWithTimeOut(task: Promise<any>, resolve: (data: any) => void, reject: (data: any) => void): Promise<any> {
        return promiseTimeout(task, this.taskTimeOut).then(value => {
            resolve(value)
        }).catch(reason => {
            reject(reason);
        });
    }

    private stackIdleTask(task: () => void, globalCancelID?: string) {
        globalCancelID = globalCancelID ? globalCancelID : "global";
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
    }

    private queueResolvableTask(task: (resolve: (data: any) => void, reject: (data: any) => void) => void, globalCancelID?: string): Promise<any> {
        this.lastPromise = this.lastPromise.then(() => {
            return new Promise((resolve, reject) => {
                this.stackIdleTask(() => {
                    task(resolve, reject);
                }, globalCancelID);
            });
        });
        return this.lastPromise;
    }

    addTask(task: () => void, globalCancelID?: string): Promise<any> {
        return this.queueResolvableTask((resolve, reject) => {
            return this.resolveTaskWithTimeOut(new Promise<any>((resolveTask, rejectTask) => {
                task();
                resolveTask();
            }), resolve, reject);
        });
    }

    addResolvableTask(task: (resolve: (data: any) => void, reject: (data: any) => void) => void): Promise<any> {
        return this.queueResolvableTask((resolve, reject) => {
            return this.resolveTaskWithTimeOut(new Promise<any>((resolveTask, rejectTask) => {
                task(resolveTask,rejectTask);
            }), resolve, reject);
        });
    }

}