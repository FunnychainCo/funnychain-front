import * as EventEmitter from "eventemitter3/index";
import {audit} from "./Audit";
import {pushNotificationService} from "./PushNotificationService";

declare let navigator:any;
declare let window:any;
export class UserNotificationService {
    eventEmitter = new EventEmitter();
    visible:boolean = true;
    callback = (message) => {
    };

    start(callback) {
        this.callback = callback;
        document.addEventListener("visibilitychange", () => {
            this.visible = document.visibilityState === 'visible';
        });

        if('serviceWorker' in navigator){
            // Handler for messages coming from the service worker
            //http://craig-russell.co.uk/2016/01/29/service-worker-messaging.html#.W9t50pP0laQ
            navigator.serviceWorker.addEventListener('message', (event) => {
                let cmd = event.data;
                let data = cmd.data;
                if(cmd.cmd==="NOTIFY_USER"){
                    if(this.visible){
                        event.ports[0].postMessage("OK");
                    }else{
                        event.ports[0].postMessage("NOK");
                    }
                    //we notify even if there is a NOK (just in case)
                    this.notifyUIToNotifyUser(data.message);
                }else if(cmd.cmd==="SW_REQ_NOTIFICATION_PERMISSION"){
                    event.ports[0].postMessage("OK");
                    if(this.needsPermission()) {
                        window.Notification.requestPermission((perm) => {
                            this.eventEmitter.emit("new_notification_state",this.getNotificationState());
                            console.log("requestPermission => " + perm);
                        });
                    }
                }else{
                    audit.reportError("unknown command : ",event);
                }
            });
        }

        /*setTimeout(()=>{
            navigator.serviceWorker.controller.postMessage("Client 1 says");
        },3000);*/
    }


    onNotificationState(callback:(granted:boolean)=>void):()=>void{
        this.eventEmitter.on("new_notification_state",callback);
        this.eventEmitter.emit("new_notification_state",this.getNotificationState());
        return ()=>{
            this.eventEmitter.off("new_notification_state",callback);
        }
    }

    getNotificationState():boolean{
        return !this.needsPermission();
    }

    setNotificationState(granted:boolean){
        if(granted) {
            Notification.requestPermission().then((permission)=> {
                this.eventEmitter.emit("new_notification_state",this.getNotificationState());
            });
        }else{
            //TODO store in nvm to disable notification
        }
    }

    needsPermission(){
        let N = window.Notification;
        return N && N.permission && N.permission === 'granted' ? false : true;
    }

    updateNotification(uid:string){
        if(!this.needsPermission()) {
            pushNotificationService.unregisterPushNotification();
            pushNotificationService.registerPushNotification(uid);
        }
    }

    notifyUserExternal(title,message) {

    }

    notifyUIToNotifyUser(message) {
        this.callback(message);
    }

}

export var userNotificationService = new UserNotificationService();
