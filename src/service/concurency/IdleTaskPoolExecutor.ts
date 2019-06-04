declare let window: any;

export class IdleTaskPoolExecutor {

    starter: () => void;
    lastPromise: Promise<any>;

    constructor() {
        this.lastPromise = new Promise(resolve => {
            this.starter = resolve;
        });
        if(typeof (window) !== 'undefined') {
            window.requestIdleCallback(() => {
                this.starter();
            });
        }else{
            this.starter();
        }
    }

    addTask(task: () => void): Promise<any> {
        this.lastPromise = this.lastPromise.then(() => {
            if(typeof (window) !== 'undefined') {
                window.requestIdleCallback(() => {
                    task();
                });
            }else{
                task();
            }
        });
        return this.lastPromise;
    }

    addResolvableTask(task: (resolve: (data: any) => void, reject: (data: any) => void) => void): Promise<any> {
        this.lastPromise = this.lastPromise.then(() => {
            return new Promise((resolve, reject) => {
                if(typeof (window) !== 'undefined') {
                    window.requestIdleCallback(() => {
                        task(resolve, reject);
                    });
                }else{
                    task(resolve, reject);
                }
            })
        });
        return this.lastPromise;
    }

}