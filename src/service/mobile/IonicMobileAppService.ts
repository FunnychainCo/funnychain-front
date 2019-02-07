declare let window:any;
import * as jquery from "jquery";
let $: any = jquery;

export class IonicMobileAppService {

    constructor() {
    }

    start(){
        if(window._cordovaNative){
            console.log("native scripts detected");
            $('body').append("<app-root></app-root>" +
                "<script type=\"text/javascript\" src=\"http://localhost/2.js\"></script>" +
                "<script type=\"text/javascript\" src=\"http://localhost/160.js\"></script>" +
                "<script type=\"text/javascript\" src=\"http://localhost/76.js\"></script>" +
                "<script type=\"text/javascript\" src=\"http://localhost/8.js\"></script>" +
                "<script type=\"text/javascript\" src=\"http://localhost/6.js\"></script>" +
                "<script type=\"text/javascript\" src=\"http://localhost/3.js\"></script>" +
                "<script type=\"text/javascript\" src=\"http://localhost/5.js\"></script>" +
                "<script type=\"text/javascript\" src=\"http://localhost/9.js\"></script>" +
                "<script type=\"text/javascript\" src=\"http://localhost/common.js\"></script>" +
                "<script type=\"text/javascript\" src=\"http://localhost/runtime.js\"></script>" +
                "<script type=\"text/javascript\" src=\"http://localhost/polyfills.js\"></script>" +
                "<script type=\"text/javascript\" src=\"http://localhost/cordova.js\"></script>" +
                "<script type=\"text/javascript\" src=\"http://localhost/vendor.js\"></script>" +
                "<script type=\"text/javascript\" src=\"http://localhost/main.js\"></script>");
            console.log("native scripts loaded");
        }else{
            console.log("NO native scripts detected");
        }
    }

    displayLocalNotification(data:{text:string,icon:string}){
        //this will be catch by the local ionic cordova service
        window.postMessage({type:"post_notification",data}, '*');
    }

}

export let ionicMobileAppService = new IonicMobileAppService();