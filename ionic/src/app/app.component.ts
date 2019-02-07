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
        }
        if (type === 'hide_splash_screen') {
            this.splashScreen.hide();
        }
        if (type === 'badge_set') {
            this.badge.set(cmd.data);
        }
        if (type === 'badge_increase') {
            this.badge.increase(cmd.data);
        }
        if (type === 'badge_clear') {
            this.badge.clear();
        }
    }

    sendNotification(notification: { text: string, icon: string }) {
        console.log('event', notification);
        // Schedule a single notification
        this.localNotifications.schedule({
            text: notification.text,
            icon: notification.icon,
            vibrate: true,
            led: 'ffC000',
            foreground: true
        });
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            const self = this;
            window.addEventListener('message', function (event) {
                // IMPORTANT: Check the origin of the data!
                if (event.origin.indexOf('https://alpha.funnychain.co')
                    || event.origin.indexOf('https://beta.funnychain.co')
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
            console.log('Mobile App Component service started');
        });
    }
}
