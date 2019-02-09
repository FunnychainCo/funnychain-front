declare let window:any;
import * as jquery from "jquery";
let $: any = jquery;

export class IonicMobileAppService {

    constructor() {
    }

    start(){
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
        if(window._cordovaNative){
            console.log("native scripts detected");
            $('body').append('<iframe src="http://localhost/local_iframe.html"></iframe>');
        }else{
            console.log("NO native scripts detected");
        }

        const self = this;
    }

    private dispatchCommand(cmd: { type: string, data: any }) {
        const type = cmd.type ? cmd.type : 'ERROR';
        if (type === 'send_config') {
            let importList:string[] = cmd.data;
            let scriptScting = "<app-root></app-root>";
            importList.forEach(value => {
                scriptScting+='<script type="text/javascript" src="'+value+'"></script>'
            });
            $('body').append(scriptScting);
            console.log("native scripts loaded");
        }else if(type === 'native_code_ready'){
            this.hideSplashScreen();
        }else{
            //there is a lot of unknown command but its ok
        }
    }

    badgeSet(value){
        //this will be catch by the local ionic cordova service
        window.postMessage({type:"badge_set",data:value}, '*');
    }

    badgeIncrease(value){
        //this will be catch by the local ionic cordova service
        window.postMessage({type:"badge_increase",data:value}, '*');
    }

    badgeClear(){
        //this will be catch by the local ionic cordova service
        window.postMessage({type:"badge_clear",data:{}}, '*');
    }

    hideSplashScreen(){
        //this will be catch by the local ionic cordova service
        window.postMessage({type:"hide_splash_screen",data:{}}, '*');
    }

    displayLocalNotification(data:{text:string,icon:string}){
        //this will be catch by the local ionic cordova service
        window.postMessage({type:"post_notification",data}, '*');
    }

}

export let ionicMobileAppService = new IonicMobileAppService();