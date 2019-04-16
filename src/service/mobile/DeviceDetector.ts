import MobileDetect from "mobile-detect";
import {pwaService} from "./PWAService";
import {ionicMobileAppService} from "./IonicMobileAppService";
import {isBrowserRenderMode} from "../ssr/windowHelper";

export class DeviceDetector {
    private type: string;
    private os: string;
    //windows chrome
    //android chrome
    //android pwa
    //android mobile
    //[OS] [viewer] [version]
    //OS: Windows/Mac/Linux/Ios/android
    //viewer PWA/browser/Mobile app

    start(){
        if(isBrowserRenderMode()) {
            let md = new MobileDetect(window.navigator.userAgent);
            this.os = md.os() ? md.os() : "desktop";//TODO add Windows/Mac/Linux differences? //TODO add android/ios differences?
            this.type = "";
            if (ionicMobileAppService.mobileapp) {
                this.type = "mobile";
            } else if (pwaService.runningFromPWA) {
                this.type = "pwa"
            } else {
                this.type = "web";
            }
        }else{
            this.os = "server";
            this.type = "server";
        }
    }


    getUserAgent(){
        if(isBrowserRenderMode()){
            return window.navigator.userAgent;
        }else{
            return "server render user agent";
        }
    }

    isIphoneX(){
        /**
         Screen Resolution: 375 x 812 (pixels)
         Browser Dimensions: 980 x 1956 (pixels)
         Screen Resolution: 375 x 812 (pixels)
         Browser Dimensions: 980 x 448 (pixels)

         iPhone XS Max	1242px × 2688px	2688px × 1242px => 414 x 896
         iPhone XS	1125px × 2436px	2436px × 1125px => 375 x 812
         iPhone XR	828px × 1792px	1792px × 828px => 276 x 597 ou 598
         iPhone X	1125px × 2436px	2436px × 1125px

         //https://developer.apple.com/library/archive/documentation/DeviceInformation/Reference/iOSDeviceCompatibility/Displays/Displays.html
         1125 x 2436         375 x 812         3.0         3.0
         * */
        return this.isMobile() && this.isIPhone() && (
            (screen.width==375 && screen.height==812) || //Iphone X Iphone XS
            (screen.width==375 && (screen.height==597 || screen.height==598)) || //iPhone XR
            (screen.width==414 && screen.height==896)    //iPhone XS Max
        )
    }

    getDeviceString():string{
        return this.os+"/"+this.type;
    }

    /**
     * Mobile app only
     */
    isMobile():boolean{
        return this.type === "mobile";
    }

    isAndroid():boolean{
        return this.os === "AndroidOS";
    }

    isIPhone():boolean{
        return this.os === "iOS";
    }

    isAndroidAndMobileApp():boolean{
        return this.isMobile()&&this.isAndroid();
    }
}

export let deviceDetector = new DeviceDetector();