import {LogstashAudit} from "./LogstashAudit";

declare let mixpanel: any;
declare let window: any;

export class Audit {
    additionalData: any = {};
    logstashAudit: LogstashAudit = new LogstashAudit("https://api.funnychain.co/tracking", "")

    constructor() {
        if (this.isDev()) {
            console.log("Audit in dev mode");
        }
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
        mixpanel.track(event, data);
    }

    reportError(...data: any[]) {
        let stack: any = new Error().stack;
        let finalData = {error: data, additionalData: this.additionalData, stack: stack};
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