import MobileDetect from "mobile-detect";
import {pwaService} from "./PWAService";
import {ionicMobileAppService} from "./IonicMobileAppService";

export class DeviceDetector {
    //windows chrome
    //android chrome
    //android pwa
    //android mobile
    //[OS] [viewer] [version]
    //OS: Windows/Mac/Linux/Ios/android
    //viewer PWA/browser/Mobile app

    getDeviceString():string{
        let md = new MobileDetect(window.navigator.userAgent);
        let os = md.os()?md.os():"desktop";//TODO add Windows/Mac/Linux differences? //TODO add android/ios differences?
        let type = "";
        if(ionicMobileAppService.mobileapp){
            type="mobile";
        }else if(pwaService.runningFromPWA){
            type="pwa"
        }else{
            type="web";
        }
        return os+"/"+type;
    }
}

export let deviceDetector = new DeviceDetector();