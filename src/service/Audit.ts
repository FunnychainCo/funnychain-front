import {LogstashAudit} from "./LogstashAudit";
import {GLOBAL_PROPERTIES} from "../properties/properties";
import {authService} from "./generic/AuthService";


declare let mixpanel: any;
declare let window: any;

export class Audit {
    additionalData: any = {};
    logstashAudit: LogstashAudit;

    constructor() {
        this.logstashAudit = new LogstashAudit("https://api.funnychain.co/tracking","");
        authService.onAuthStateChanged(user => {
            this.logstashAudit.setUserId(user.uid);
        });
        if (this.isDev()) {
            console.log("Audit in dev mode");
        }
        window.addEventListener("unhandledrejection", (promiseRejectionEvent) =>{
            // handle error here, for example log
            this.reportError("unhandledrejection",promiseRejectionEvent);
        });
    }

    track(event: string, data?: any): void {
        let finalData = {...data, ...this.additionalData};
        if (!this.isDev()) {
            this._track(event, finalData);
        }
    }

    isDev(): boolean {
        let href = window.location.href;
        return href.startsWith("http://localhost:") || href.startsWith("http://127.0.0.1:");
    }

    private _track(event: string, data: any): void {
        this.logstashAudit.track(event, data);
        if(GLOBAL_PROPERTIES.MIXPANEL_ACTIVATED==="true"){
            mixpanel.track(event, data);
        }
    }

    replaceErrors = (key, value) => {
        if (value instanceof Error) {
            let error = {};

            Object.getOwnPropertyNames(value).forEach(function (key) {
                error[key] = value[key];
            });

            return error;
        }

        return value;
    }

    reportError(...data: any[]) {
        let stack: any = new Error().stack;
        let finalData:any = {
            error:{},
            additionalData: this.additionalData,
            stack: stack,
            version: GLOBAL_PROPERTIES.VERSION
        };

        data.forEach((value, index) => {
            finalData.error[""+index]=JSON.stringify(value,this.replaceErrors);
        });

        if (!this.isDev()) {
            this._track("user/error", finalData);
        }
        console.error(finalData);
    }

    error(...data: any[]) {
        this.reportError(data);
    }

}

export let audit = new Audit();