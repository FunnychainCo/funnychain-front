import {Component} from '@angular/core';

import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {LocalNotifications} from '@ionic-native/local-notifications/ngx';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    constructor(private platform: Platform,
                private splashScreen: SplashScreen,
                private statusBar: StatusBar,
                private localNotifications: LocalNotifications) {
        this.initializeApp();
    }

    dispatchCommand(cmd: { type: string, data: any }) {
        const type = cmd.type ? cmd.type : 'ERROR';
        if (type === 'post_notification') {
            this.sendNotification(cmd.data);
        }
    }

    sendNotification(notification: { text: string, icon: string }) {
        console.log('event', notification);
        // Schedule a single notification
        this.localNotifications.schedule({
            text: notification.text,
            icon: notification.icon,
            vibrate: true,
            led: {color: '#ffC000', on: 500, off: 500},
            foreground: true
        });
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
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
            this.sendNotification({
                text: 'Welcome To Funnychain!',
                icon: 'https://ipfs.funnychain.co/ipfs/QmRAiJWZ2PZt1KXpBr6he1X84kfcY7UMeF2dFB9moyzXPV'
            });
            setTimeout(function () {
                console.log('timed notif');
                self.sendNotification({
                    text: 'Welcome To Funnychain 2!',
                    icon: 'https://ipfs.funnychain.co/ipfs/QmRAiJWZ2PZt1KXpBr6he1X84kfcY7UMeF2dFB9moyzXPV'
                });
            }, 20000);
        });
    }
}
