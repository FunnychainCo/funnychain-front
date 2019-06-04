declare let window: any;

export class IdleTaskPoolExecutor {

    starter: () => void;
    lastPromise: Promise<any>;

    constructor() {
        this.lastPromise = new Promise(resolve => {
            this.starter = resolve;
        });
        window.requestIdleCallback(() => {
            this.starter();
        });
    }

    addTask(task: () => void): Promise<any> {
        this.lastPromise = this.lastPromise.then(() => {
            window.requestIdleCallback(() => {
                task();
            });
        });
        return this.lastPromise;
    }

    addResolvableTask(task: (resolve: (data: any) => void, reject: (data: any) => void) => void): Promise<any> {
        this.lastPromise = this.lastPromise.then(() => {
            return new Promise((resolve, reject) => {
                window.requestIdleCallback(() => {
                    task(resolve, reject);
                });
            })
        });
        return this.lastPromise;
    }

}