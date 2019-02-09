
import {UiNotification} from "./UiNotification";
//import {WebPushNotificationService} from "./WebPushNotification";
import {OneSignalNotification} from "./OneSignalNotification";

export class UserNotificationService {
    uiNotification:UiNotification;
    //webPushNotificationService:WebPushNotificationService;
    oneSignalNotification:OneSignalNotification;

    start() {
        this.uiNotification = new UiNotification();
        this.oneSignalNotification = new OneSignalNotification();
        this.oneSignalNotification.start();
        /*this.oneSignalNotification.onNewNotificationFromServiceWorker(data => {
            data.processed(this.uiNotification.visible);
            this.notifyUIToNotifyUser(data.message);
        });*/
        /*this.webPushNotificationService = new WebPushNotificationService();
        this.webPushNotificationService.start();
        this.webPushNotificationService.onNewNotificationFromServiceWorker(data => {
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
        //this.webPushNotificationService.updateNotification(uid);
    }

    onNotificationState(callback:(granted:boolean)=>void):()=>void{
        return this.oneSignalNotification.onNotificationState(callback);
        //return this.webPushNotificationService.onNotificationState(callback);
    }

    setNotificationState(granted:boolean):void {
        this.oneSignalNotification.setNotificationState(granted);
        //this.webPushNotificationService.setNotificationState(granted);
    }
}

export let userNotificationService = new UserNotificationService();
