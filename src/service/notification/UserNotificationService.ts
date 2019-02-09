
import {UiNotification} from "./UiNotification";
import {OneSignalNotification} from "./OneSignalNotification";

export class UserNotificationService {
    uiNotification:UiNotification;
    oneSignalNotification:OneSignalNotification;

    start() {
        this.uiNotification = new UiNotification();
        this.oneSignalNotification = new OneSignalNotification();
        this.oneSignalNotification.start();
        /*this.oneSignalNotification.onNewNotificationFromServiceWorker(data => {
            data.processed(this.uiNotification.visible);
            this.notifyUIToNotifyUser(data.message);
        });*/
    }

    //ui part
    notifyUIToNotifyUser(message):void {
        this.uiNotification.notifyUIToNotifyUser(message);
    }

    sendNotificationToUser(message):void{
        this.uiNotification.notifyUIToNotifyUser(message);
    }

    setUiCallBackForNotification(callback:(message:string)=>void):void{
        this.uiNotification.setUiCallBackForNotification(callback);
    }

    //service worker server part
    updateNotification(uid: string):void {
        this.oneSignalNotification.updateNotification(uid);
    }

    onNotificationState(callback:(granted:boolean)=>void):()=>void{
        return this.oneSignalNotification.onNotificationState(callback);
    }

    setNotificationState(granted:boolean):void {
        this.oneSignalNotification.setNotificationState(granted);
    }
}

export let userNotificationService = new UserNotificationService();
