import {TaskPoolExecutor} from "../TaskPoolExecutor";

declare let window: any;
import * as jquery from "jquery";
import EventEmitter from "eventemitter3/index";


let $: any = jquery;

export class IonicMobileAppService {
    eventEmitter = new EventEmitter();
    private pool: TaskPoolExecutor;

    mobileapp: boolean = false;

    constructor() {
        this.pool = new TaskPoolExecutor();//concurrency limit of 1
    }


    start() {
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
                console.log('HACK from: ' + event.origin);
                return;
            }
        });
        if (window._cordovaNative) {
            //console.log("native scripts detected");
            this.mobileapp = true;
            $('body').append('<iframe src="http://localhost/local_iframe.html"></iframe>');
        } else {
            this.mobileapp = false;
            //console.log("NO native scripts detected");
        }

        const self = this;

        this.onNativeEvent("native_code_ready", () => {
            this.hideSplashScreen();
        })
    }

    onNativeEvent(event: string, callback: (data: any) => void): () => void {
        this.eventEmitter.on(event, callback);
        return () => {
            this.eventEmitter.off(event, callback);
        }
    }

    private dispatchCommand(cmd: { type: string, data: any }) {
        const type = cmd.type ? cmd.type : 'ERROR';
        if (type === 'send_config') {
            let importList: string[] = cmd.data;
            let scriptScting = "<app-root></app-root>";
            importList.forEach(value => {
                scriptScting += '<script type="text/javascript" src="' + value + '"></script>'
            });
            $('body').append(scriptScting);
            console.log("native scripts loaded");
            this.pool.start();
        } else if (type === 'native_code_event') {
            let event = cmd.data.event;
            console.log("event :"+event);
            let eventdata = cmd.data.evd;
            this.eventEmitter.emit(event, eventdata);
        } else {
            //there is a lot of unknown command but its ok
        }
    }

    sendMessageToNative(cmd: string, data: any) {
        //this will be catch by the local ionic cordova service
        this.pool.addTask(() => {
            console.log("command :"+cmd);
            window.postMessage({type: cmd, data: data}, '*');
        });
    }

    badgeSet(value) {
        this.sendMessageToNative("badge_set", value);
    }

    badgeIncrease(value) {
        this.sendMessageToNative("badge_increase", value);
    }

    badgeClear() {
        this.sendMessageToNative("badge_clear", {});
    }

    hideSplashScreen() {
        this.sendMessageToNative("hide_splash_screen", {});
    }

    displayLocalNotification(data: { text: string, icon: string }) {
        this.sendMessageToNative("post_notification", data);
    }

}

export let ionicMobileAppService = new IonicMobileAppService();