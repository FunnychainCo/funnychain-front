
import {UiNotification} from "./UiNotification";
import {OneSignalNotificationWebSDK} from "./OneSignalNotificationWebSDK";
import {ionicMobileAppService} from "../mobile/IonicMobileAppService";
import {OneSignalNotificationMobileSDK} from "./OneSignalNotificationMobileSDK";
import {GLOBAL_PROPERTIES} from "../../properties/properties";
import axios from 'axios'
import {RemoteHashMap} from "../RemoteHashMap";
import {audit} from "../Audit";
import EventEmitter from "eventemitter3";
import {UiNotificationData} from "../generic/Notification";

export interface Message{
    text:string,
    type:string,
    date:number,
}

export class UserNotificationService {
    uiNotification:UiNotification;
    oneSignalNotification:any;//TODO interface
    uid:string="";
    public notifications:RemoteHashMap<UiNotificationData> = new RemoteHashMap();
    unseenNotificationNumber:number=0;
    private eventEmitter = new EventEmitter();

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
            this.sendNotificationToUser(data.message);
        });
        this.notifications.onEntry(data => {
            this.updateUnseenNumber();
        },hash => {
            this.updateUnseenNumber();
        },data => {
            this.updateUnseenNumber();
        })
    }

    updateUnseenNumber(){
        let locales = this.notifications.getLocalValue();
        let count = 0;
        Object.keys(locales).forEach(key => {
            if(!locales[key].seen){
                count++;
            }
        });
        this.unseenNotificationNumber=count;
        this.eventEmitter.emit("change",this.unseenNotificationNumber);
    }

    markAllAsSeen():void{
        if(!this.uid || this.uid===""){
            return;
        }
        axios.get(GLOBAL_PROPERTIES.NOTIFICATION_SERVICE_MARK_SEEN() + this.uid + "/" + "all", {}).then((response) => {
            this.notifications.refresh();
        }).catch(reason => {
            audit.error(reason);
        });
    }

    onUnseenNumberChange(callback:(number:number)=>void):()=>void{
        this.eventEmitter.on("change", callback);
        callback(this.unseenNotificationNumber);
        return () => {
            this.eventEmitter.off("change", callback);
        };
    }

    //ui part
    sendNotificationToUser(message:string):void {
        this.uiNotification.sendNotificationToUser({text: message, type: "text",date:new Date().getTime()});
    }

    sendNotificationMessageToUser(message:Message):void {
        this.uiNotification.sendNotificationToUser(message);
    }

    setUiCallBackForNotification(callback:(message:Message)=>void):void{
        this.uiNotification.setUiCallBackForNotification(callback);
    }

    //service worker server / app closed part
    updateNotification(uid: string):void {
        this.uid = uid;
        if(this.uid && this.uid!=="") {
            this.unseenNotificationNumber = 0;
            this.notifications.setResync(callback => {
                axios.get(GLOBAL_PROPERTIES.NOTIFICATION_SERVICE_GET_ALL() + this.uid, {}).then((response) => {
                    let map = response.data;
                    callback(map);
                }).catch(reason => {
                    audit.error(reason);
                });
            });

            this.notifications.setAddEventNotifier(callback => {
                this.oneSignalNotification.onNewNotificationFromServiceWorker(data => {
                    let hash = data.hash;
                    axios.get(GLOBAL_PROPERTIES.NOTIFICATION_SERVICE_GET() + this.uid + "/" + hash, {}).then((response) => {
                        let notif = response.data;
                        callback({
                            hash: hash,
                            entry: notif
                        });
                    }).catch(reason => {
                        audit.error(reason);
                    });
                });
            });
            this.notifications.refresh();
        }
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
