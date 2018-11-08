declare let mixpanel:any;

export class Audit {
    additionalData:any={};
    track(event:string,data:any):void {
        let finalData = {...data,...this.additionalData}
        mixpanel.track(event,finalData);
    }

    reportError(error:any){
        mixpanel.track("error/client",error);
        console.error(error);
    }
}

export let audit = new Audit();