// tslint:disable:no-console
// TODO check https://developers.google.com/web/tools/workbox/

import {backEndPropetiesProvider} from "./BackEndPropetiesProvider";


export class PushNotificationService {
    lifeData:any = {};

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

    unregisterPushNotification() {

    }

    registerPushNotification(uid) {
        let subscribeAdresse = backEndPropetiesProvider.getProperty("PUSH_NOTIFICATION_SERVICE")+"/subscribe/";
        const publicVapidKey = backEndPropetiesProvider.getProperty("vapidPublicKey");
        navigator.serviceWorker.ready.then(registration => {
            registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(publicVapidKey)
            }).then((subscription) => {
                this.lifeData.subscription = subscription;//save latest subscription
                fetch(subscribeAdresse+uid, {
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

export var pushNotificationService = new PushNotificationService();
