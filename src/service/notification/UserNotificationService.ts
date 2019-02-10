
import {UiNotification} from "./UiNotification";
import {OneSignalNotificationWebSDK} from "./OneSignalNotificationWebSDK";
import {ionicMobileAppService} from "../mobile/IonicMobileAppService";
import {OneSignalNotificationMobileSDK} from "./OneSignalNotificationMobileSDK";
import {GLOBAL_PROPERTIES} from "../../properties/properties";

export class UserNotificationService {
    uiNotification:UiNotification;
    oneSignalNotification:any;//TODO interface

    start() {

        let API_KEY = GLOBAL_PROPERTIES.ONE_SIGNAL_API_KEY();
        let ANDROID_ID= GLOBAL_PROPERTIES.ONE_SIGNAL_ANDROID_NUMBER();

        this.uiNotification = new UiNotification();
        if(ionicMobileAppService.mobileapp){
            this.oneSignalNotification = new OneSignalNotificationMobileSDK(API_KEY,ANDROID_ID);
            this.oneSignalNotification.start();
        }else{
            this.oneSignalNotification = new OneSignalNotificationWebSDK(API_KEY);
            this.oneSignalNotification.start();
        }
        this.oneSignalNotification.onNewNotificationFromServiceWorker(data => {
            this.notifyUIToNotifyUser(data.message);
        });
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
