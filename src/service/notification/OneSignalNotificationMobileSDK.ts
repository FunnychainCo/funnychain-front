import {ionicMobileAppService} from "../mobile/IonicMobileAppService";
import {TaskPoolExecutor} from "../concurency/TaskPoolExecutor";

export class OneSignalNotificationMobileSDK {
    private pool: TaskPoolExecutor;


    constructor(private API_KEY: string, private ANDROID_ID: string) {
        this.pool = new TaskPoolExecutor();
    }

    onNewNotificationFromServiceWorker(callback: (data: { title: string, message: string,hash:string }) => void): ()=>void  {
        return ionicMobileAppService.onNativeEvent("native_notification_received", (data)=>{
            callback({
                title:data.payload.title,
                message:data.payload.body,
                hash:data.payload.data.hash,
            })
        });
    }

    start() {
        ionicMobileAppService.onNativeEvent("native_code_ready", () => {
            ionicMobileAppService.sendMessageToNative("initialize_one_signal", {
                appId: this.API_KEY,
                androidId: this.ANDROID_ID
            });
            ionicMobileAppService.onNativeEvent("native_notification_ready", data => {
                this.pool.start();
            });
        })
    }

    //service worker server part
    updateNotification(uid: string): void {
        this.pool.addTask((() => {
            ionicMobileAppService.sendMessageToNative("change_notification_uid", uid);
        }));
    }

    onNotificationState(callback: (isSubscribed: boolean) => void): () => void {
        return ionicMobileAppService.onNativeEvent("notification_subscription_changes", callback);
    }

    setNotificationState(granted: boolean): void {
        if (granted) {
            this.pool.addTask((() => {
                ionicMobileAppService.sendMessageToNative("prompt_notification_authorization", {});
            }));
        } else {
            this.updateNotification("");
        }
    }

}
