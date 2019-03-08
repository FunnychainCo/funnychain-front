import MobileDetect from "mobile-detect";
import {pwaService} from "./PWAService";
import {ionicMobileAppService} from "./IonicMobileAppService";

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
        let md = new MobileDetect(window.navigator.userAgent);
        this.os = md.os()?md.os():"desktop";//TODO add Windows/Mac/Linux differences? //TODO add android/ios differences?
        this.type = "";
        if(ionicMobileAppService.mobileapp){
            this.type="mobile";
        }else if(pwaService.runningFromPWA){
            this.type="pwa"
        }else{
            this.type="web";
        }
    }

    getDeviceString():string{
        return this.os+"/"+this.type;
    }

    isMobile():boolean{
        return this.type === "mobile";
    }

    isAndroid():boolean{
        return this.os === "AndroidOS";
    }

    isAndroidAndMobileApp():boolean{
        return this.isMobile()&&this.isAndroid();
    }
}

export let deviceDetector = new DeviceDetector();