import {audit} from "./Audit";

declare let navigator:any;
declare let window:any;
export class UserNotificationService {
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

    needsPermission(){
        let N = window.Notification;
        return N && N.permission && N.permission === 'granted' ? false : true;
    }

    notifyUserExternal(title,message) {

    }

    notifyUIToNotifyUser(message) {
        this.callback(message);
    }



}

export var userNotificationService = new UserNotificationService();
