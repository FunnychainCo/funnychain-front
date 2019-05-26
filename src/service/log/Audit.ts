import {LogstashAudit} from "./LogstashAudit";
import {GLOBAL_PROPERTIES, isDev} from "../../properties/properties";
import {authService} from "../generic/AuthService";
import {getWindow, isBrowserRenderMode} from "../ssr/windowHelper";

export class Audit {
    additionalData: any = {};
    logstashAudit: LogstashAudit;

    constructor() {
        this.logstashAudit = new LogstashAudit("https://api.funnychain.co/tracking", "");
        authService.onAuthStateChanged(user => {
            this.logstashAudit.setUserId(user.uid);
        });
        if (this.isDev()) {
            console.log("Audit in dev mode");
        }else {
            if(isBrowserRenderMode()) {
                getWindow().addEventListener("unhandledrejection", (promiseRejectionEvent) => {
                    promiseRejectionEvent.promise.catch((err)=>{
                        // handle error here, for example log
                        this.error("unhandledrejection", {
                            reason:promiseRejectionEvent.reason,
                            err:err
                        });
                    }).catch((err)=>{
                        console.error(err);
                    });
                });
                /*//debug unhanded
                new Promise((resolve, reject) => {
                   reject("this error");
                });*/
            }
        }
    }

    track(event: string, data?: any): void {
        let finalData = {...data, ...this.additionalData};
        if (!this.isDev()) {
            this._track(event, finalData);
        }
    }

    reportError(...data: any[]) {
        this.error(data);
    }

    error(...data: any[]) {
        this.report("user/error", data);
    }

    warn(...data: any[]) {
        this.report("user/warn", data);
    }

    log(...data: any[]) {
        this.track("user/log", data);
    }

    private isDev(): boolean {
        return isDev();
    }

    private _track(event: string, data: any): void {
        try {
            this.logstashAudit.track(event, data).catch(reason => {
                //sometime big data in finalData value or strange stringification may cause the event to
                //not be notified so we always double error event
                this.logstashAudit.track(event, {}).catch(reason => {
                    console.error(reason);
                    //do nothing to prevent loop of error notification
                });
            });
        }catch (err){
            //sometime big data in finalData value or strange stringification may cause the event to
            //not be notified so we always double error event
            this.logstashAudit.track(event, {}).catch(reason => {
                console.error(reason);
                //do nothing to prevent loop of error notification
            });
        }
    }

    private replaceErrors = (key, value) => {
        if (value instanceof Error) {
            let error = {};

            Object.getOwnPropertyNames(value).forEach(function (key) {
                error[key] = value[key];
            });

            return error;
        }

        return value;
    };

    private report(event: string, ...data: any[]) {
        let finalData: any = {
            error: {},
            additionalData: "stringify error",
            stack: "stringify error",
            version: GLOBAL_PROPERTIES.VERSION()
        };

        try {
            let stack: any = new Error().stack;
            finalData.stack=JSON.stringify(stack);
        }catch (e) {
            // do nothing
        }

        try {
            finalData.additionalData = JSON.stringify(this.additionalData);
        }catch (e) {
            // do nothing
        }

        try {
            data.forEach((value, index) => {
                finalData.error["" + index] = JSON.stringify(value, this.replaceErrors);
            });
        }catch (e) {
            // do nothing
        }

        if (!this.isDev()) {
            this._track(event, finalData);
        }

        if (event === "user/error") {
            console.error(finalData);
            if (this.isDev()) {
                throw new Error(finalData);
            }
        } else if (event === "user/warn") {
            console.warn(finalData);
        } else if (event === "user/log") {
            console.log(finalData);
        }
    }

}

export let audit = new Audit();