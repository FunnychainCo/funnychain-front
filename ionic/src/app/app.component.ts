import {Component} from '@angular/core';

import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {LocalNotifications} from '@ionic-native/local-notifications/ngx';
import {Badge} from '@ionic-native/badge/ngx';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    private currentUser: string;
    private oneSignal: any;
    private version: "1.0.1";

    constructor(private platform: Platform,
                private splashScreen: SplashScreen,
                private statusBar: StatusBar,
                private localNotifications: LocalNotifications,
                private badge: Badge) {
        this.initializeApp();
    }

    dispatchCommand(cmd: { type: string, data: any }) {
        const type = cmd.type ? cmd.type : 'ERROR';
        if (type === 'post_notification') {
            this.sendNotification(cmd.data);
        } else if (type === 'hide_splash_screen') {
            console.log('hide_splash_screen');
            this.splashScreen.hide();
        } else if (type === 'badge_set') {
            console.log('badge_set: ' + cmd.data);
            this.badge.set(cmd.data);
        } else if (type === 'badge_increase') {
            this.badge.increase(cmd.data);
        } else if (type === 'badge_clear') {
            console.log('badge_clear');
            this.badge.clear();
        } else if (type === 'initialize_one_signal') {
            const dataOS = cmd.data;
            this.initializeOneSignal(dataOS.appId, dataOS.androidId);
        } else if (type === 'change_notification_uid') {
            this.changeNotificationUID(cmd.data);
        } else if (type === 'prompt_notification_authorization') {
            this.oneSignal.promptForPushNotificationsWithUserResponse(function (accepted) {
                console.log("User accepted notifications: " + accepted);
            });
        } else if (type === 'get_notification_state') {
            this.getNotificationState();
        } else {
            //there is a lot of unknown command but its ok
        }
    }

    changeNotificationUID(uid: string) {
        if (this.oneSignal) {
            //uid "" means unsubscribe "aka deconnexion"
            //ascociate current user id to the device
            //unsubscribe other userid from this device /!\
            //https://documentation.onesignal.com/docs/web-push-sdk#section--setexternaluserid-
            if (this.currentUser !== uid) {
                this.oneSignal.removeExternalUserId();
                console.log('User unsubscribed: ' + this.currentUser);
            }
            if (uid !== '') {
                setTimeout(() => {
                    console.log('User subscribed: ' + uid);
                    this.oneSignal.setExternalUserId(uid);
                    this.currentUser = uid;
                }, 2000);
            } else {
                this.currentUser = uid;
            }
            this.getNotificationState();
        }
    }

    initializeOneSignal(appId, androidId) {
        const notificationOpenedCallback = (jsonData) => {
            this.sendEvent('native_notification_opened', jsonData);
        };

        const notificationReceivedCallback = (jsonData) => {
            this.sendEvent('native_notification_received', jsonData);
        };

        window['plugins'].OneSignal
            .startInit(appId, androidId)
            .handleNotificationOpened(notificationOpenedCallback)
            .handleNotificationReceived(notificationReceivedCallback)
            .inFocusDisplaying(window['plugins'].OneSignal.OSInFocusDisplayOption.None)
            .endInit();
        this.oneSignal = window['plugins'].OneSignal;
        this.sendEvent('native_notification_ready', {});
    }

    sendNotification(notification: { text: string, icon: string }) {
        console.log('notification', notification);
        // Schedule a single notification
        this.localNotifications.schedule({
            text: notification.text,
            icon: notification.icon,
            vibrate: true,
            led: 'ffC000',
            foreground: true
        });
    }

    getNotificationState() {
        this.oneSignal.getPermissionSubscriptionState((status) => {
            /*status.permissionStatus.hasPrompted; // Bool
            status.permissionStatus.status; // iOS only: Integer: 0 = Not Determined, 1 = Denied, 2 = Authorized
            status.permissionStatus.state; //Android only: Integer: 1 = Authorized, 2 = Denied

            status.subscriptionStatus.subscribed; // Bool
            status.subscriptionStatus.userSubscriptionSetting; // Bool
            status.subscriptionStatus.userId; // String: OneSignal Player ID
            status.subscriptionStatus.pushToken; // String: Device Identifier from FCM/APNs*/
            this.sendEvent("notification_subscription_changes", status.permissionStatus.status && status.subscriptionStatus.subscribed);
        });
    }

    sendEvent(event: string, data: any) {
        window.postMessage({
            type: 'native_code_event', data: {
                event: event,
                evd: data
            }
        }, '*');
    }

    initializeApp() {
        console.log('Mobile App initializeApp');
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            const self = this;
            this.platform.resume.subscribe((e) => {
                this.sendEvent('native_code_resume', {});
            });
            this.platform.backButton.subscribe((e) => {
                this.sendEvent('native_back_button', {});
            });
            window.addEventListener('message', function (event) {
                // IMPORTANT: Check the origin of the data!
                if (event.origin.indexOf('https://alpha.funnychain.co')
                    || event.origin.indexOf('https://beta.funnychain.co')
                    || event.origin.indexOf('http://alpha.funnychain.co')
                    || event.origin.indexOf('http://beta.funnychain.co')
                    || event.origin.indexOf('http://mobile.alpha.funnychain.co')
                    || event.origin.indexOf('http://mobile.beta.funnychain.co')
                    || event.origin.indexOf('http://localhost')) {
                    // The data has been sent from your site
                    // The data sent with postMessage is stored in event.data
                    self.dispatchCommand(event.data);
                } else {
                    // The data hasn't been sent from our site!
                    // Be careful! Do not use it.
                    //TODO report error
                    console.log('HACK from: ' + event.origin);
                    return;
                }
            });
            this.sendEvent('native_code_ready', {});
            setTimeout(()=>{
                this.splashScreen.hide();
            },20000);
            console.log('Mobile component loaded version:' + this.version);
        });
    }
}
