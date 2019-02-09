declare let window: any;
import EventEmitter from "eventemitter3/index";

export class OneSignalNotification {
    private oneSignal: any;
    eventEmitter = new EventEmitter();
    currentUser:string = "";

    start() {
        let API_KEY = "dc7c1d29-5ea3-4967-baac-a64f0be10c95";//local
        //let API_KEY = "1d106801-b574-4616-93aa-d281b3c21600";//alpha
        //let API_KEY = "a9c4c96f-0711-4010-8d9f-7a8faee2813b";//beta
        this.oneSignal = window.OneSignal || [];
        this.oneSignal.push(() => {
            this.oneSignal.init({
                appId: API_KEY,
                autoRegister: false,
                notifyButton: {
                    enable: false,
                },
            });
        });
        this.onNotificationState(isSubscribed => {
            console.log("subscription status changed");
        })
    }

    //service worker server part
    updateNotification(uid: string):void {
        this.currentUser=uid;
        this.oneSignal.push(()=> {
            //uid "" means unsubscribe "aka deconnexion"
            //ascociate current user id to the device
            //unsubscribe other userid from this device /!\
            //https://documentation.onesignal.com/docs/web-push-sdk#section--setexternaluserid-
            this.oneSignal.getExternalUserId().then(storeduid =>{
                if(storeduid!==uid){
                    this.oneSignal.removeExternalUserId();
                    console.log("User unsubscribed: "+storeduid);
                }
                if(uid!=="") {
                    setTimeout(()=>{
                        this.oneSignal.getUserId(function(userId) {
                            console.log("OneSignal User ID:", userId);
                            // (Output) OneSignal User ID: 270a35cd-4dda-4b3f-b04e-41d7463a2316
                        });
                        console.log("User subscribed: "+uid);
                        this.oneSignal.setExternalUserId(uid);
                    },2000);
                }
            })
        });
    }

    onNotificationState(callback:(isSubscribed:boolean)=>void):()=>void{
        //https://documentation.onesignal.com/docs/web-push-sdk#section-subscription-change
        let wrappedCallBack = (isSubscribed) => {
            callback(isSubscribed);
        };

        this.oneSignal.isPushNotificationsEnabled((isSubscribed) => {
            callback(isSubscribed)
        });
        this.oneSignal.push(() => {
            // Occurs when the user's subscription changes to a new value.
            this.oneSignal.on('subscriptionChange', wrappedCallBack);
        });
        return () => {
            this.oneSignal.off('subscriptionChange',wrappedCallBack);
        }
    }

    setNotificationState(granted:boolean):void {
        if (granted) {
            this.oneSignal.push(()=>{
                this.oneSignal.registerForPushNotifications();
            });
        } else {
            //TODO store in nvm to disable notification
        }
    }

}
