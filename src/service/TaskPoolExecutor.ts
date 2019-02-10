export class TaskPoolExecutor {

    starter: () => void;
    lastPromise: Promise<any>;

    constructor() {
        this.lastPromise = new Promise(resolve => {
            this.starter = resolve;
        });
    }

    start() {
        this.starter();
    }

    addTask(task: () => void):Promise<any> {
        this.lastPromise = this.lastPromise.then(() => {
            return new Promise(resolve => {
                task();
                resolve();
            })
        });
        return this.lastPromise;
    }

    addResolvableTask(task: (resolve: (data: any) => void, reject: (data: any) => void) => void):Promise<any> {
        this.lastPromise = this.lastPromise.then(() => {
            return new Promise((resolve,reject) => {
                task(resolve, reject);
            })
        });
        return this.lastPromise;
    }

}