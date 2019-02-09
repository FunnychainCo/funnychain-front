// tslint:disable:no-console
// TODO check https://developers.google.com/web/tools/workbox/

import {GLOBAL_PROPERTIES} from "../../properties/properties";
import {audit} from "../Audit";
import EventEmitter from "eventemitter3/index";

declare let navigator: any;
declare let window: any;

export class WebPushNotificationService {
    eventEmitter = new EventEmitter();
    lifeData: any = {};

    /**
     * urlBase64ToUint8Array
     *
     * @param {string} base64String a public vavid key
     */
    urlBase64ToUint8Array(base64String) {
        var padding = '='.repeat((4 - base64String.length % 4) % 4);
        var base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        var rawData = window.atob(base64);
        var outputArray = new Uint8Array(rawData.length);

        for (var i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    start() {
        if ('serviceWorker' in navigator) {
            // Handler for messages coming from the service worker
            //http://craig-russell.co.uk/2016/01/29/service-worker-messaging.html#.W9t50pP0laQ
            navigator.serviceWorker.addEventListener('message', (event) => {
                let cmd = event.data;
                let data = cmd.data;
                if (cmd.cmd === "NOTIFY_USER") {
                    this.eventEmitter.emit("onNewNotificationFromServiceWorker", {message:data.message,processed:(value)=>{
                        if (value) {
                            event.ports[0].postMessage("OK");
                        } else {
                            event.ports[0].postMessage("NOK");
                        }
                    }});
                } else if (cmd.cmd === "SW_REQ_NOTIFICATION_PERMISSION") {
                    event.ports[0].postMessage("OK");
                    if (this.needsPermission()) {
                        window.Notification.requestPermission((perm) => {
                            this.eventEmitter.emit("new_notification_state", this.getNotificationState());
                            console.log("requestPermission => " + perm);
                        });
                    }
                } else {
                    audit.reportError("unknown command : ", event);
                }
            });
        }
    }

    onNewNotificationFromServiceWorker(callback: (data: {
        message: string,
        processed: (value: boolean) => void
    }) => void): () => void {
        this.eventEmitter.on("onNewNotificationFromServiceWorker", callback);
        return () => {
            this.eventEmitter.off("onNewNotificationFromServiceWorker", callback);
        }
    }

    onNotificationState(callback: (granted: boolean) => void): () => void {
        this.eventEmitter.on("new_notification_state", callback);
        this.eventEmitter.emit("new_notification_state", this.getNotificationState());
        return () => {
            this.eventEmitter.off("new_notification_state", callback);
        }
    }


    updateNotification(uid: string):void {
        if (!this.needsPermission()) {
            this.unregisterPushNotification();
            this.registerPushNotification(uid);
        }
    }

    getNotificationState(): boolean {
        return !this.needsPermission();
    }

    setNotificationState(granted: boolean) {
        if (granted) {
            Notification.requestPermission().then((permission) => {
                this.eventEmitter.emit("new_notification_state", this.getNotificationState());
            });
        } else {
            //TODO store in nvm to disable notification
        }
    }

    needsPermission() {
        let N = window.Notification;
        return N && N.permission && N.permission === 'granted' ? false : true;
    }

    unregisterPushNotification() {

    }

    registerPushNotification(uid) {
        let subscribeAdresse = GLOBAL_PROPERTIES.PUSH_NOTIFICATION_SERVICE_SUBSCRIBE();
        const publicVapidKey = GLOBAL_PROPERTIES.vapidPublicKey();
        navigator.serviceWorker.ready.then(registration => {
            registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(publicVapidKey)
            }).then((subscription) => {
                this.lifeData.subscription = subscription;//save latest subscription
                fetch(subscribeAdresse + uid, {
                    method: 'POST',
                    body: JSON.stringify(subscription),
                    headers: {
                        'content-type': 'application/json'
                    }
                }).then(() => {
                    console.log("Subscription for Push successful: ", subscription);
                })
            }).catch((error) => {
                console.log("Subscription for Push failed", error);
            });
        });
    }
}
