
export class UiNotification {
    visible:boolean = true;
    callback:(message:string)=>void = (message) => {
    };

    start() {
        document.addEventListener("visibilitychange", () => {
            this.visible = document.visibilityState === 'visible';
        });
    }

    setUiCallBackForNotification(callback:(message:string)=>void){
        this.callback = callback;
    }

    uiVisible():boolean{
        return this.visible;
    }

    notifyUIToNotifyUser(message) {
        this.callback(message);
    }

    sendNotificationToUser(message){
        this.notifyUIToNotifyUser(message);
    }
}
