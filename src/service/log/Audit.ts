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
                    // handle error here, for example log
                    this.error("unhandledrejection", promiseRejectionEvent);
                });
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
            this.logstashAudit.track(event, data);
            if(isBrowserRenderMode()) {
                if (getWindow().mixpanel && GLOBAL_PROPERTIES.MIXPANEL_ACTIVATED() === "true") {
                    getWindow().mixpanel.track(event, data);
                }
            }
        }catch (err){
            console.error(err);
            //do nothing
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
        let stack: any = new Error().stack;
        let finalData: any = {
            error: {},
            additionalData: JSON.stringify(this.additionalData),
            stack: JSON.stringify(stack),
            version: GLOBAL_PROPERTIES.VERSION()
        };

        data.forEach((value, index) => {
            finalData.error["" + index] = JSON.stringify(value, this.replaceErrors);
        });

        if (!this.isDev()) {
            this._track(event, finalData);
            if(event==="user/error") {
                //sometime big data in finalData value or strange stringification may cause the event to
                //not be notified so we always double error event
                this._track(event, {});
            }
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