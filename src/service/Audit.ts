declare let mixpanel:any;
declare let window:any;

export class Audit {
    additionalData:any={};
    constructor(){
        if(this.isDev()) {
            console.log("Audit in dev mode");
        }
    }
    track(event:string,data:any):void {
        let finalData = {...data,...this.additionalData};
        if(!this.isDev()) {
            mixpanel.track(event, finalData);
        }
    }

    isDev():boolean{
        let href = window.location.href;
        return href.startsWith("http://localhost:") || href.startsWith("http://127.0.0.1:")
    }

    reportError(...data:any[]){
        let stack:any = new Error().stack;
        let finalData = {error:data,additionalData:this.additionalData,stack:stack};
        if(!this.isDev()) {
            mixpanel.track("error/client", finalData);
        }
        console.error(finalData);
    }

}

export let audit = new Audit();