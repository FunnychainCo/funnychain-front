import * as EventEmitter from "eventemitter3/index";

declare let window:any;

export class PWAService {

    _promptEvent:any = null;

    installPromptChange = 'PWAService.installpromptchange';
    eventEmitter = new EventEmitter();

    /**
     * ADD this script as soon as possible
     <script>
     window._promptEventForPWA = null;
     window.addEventListener("beforeinstallprompt", function(ev){
            console.log("early beforeinstallprompt received");
            ev.preventDefault();// Stop Chrome from asking _now_
            window._promptEventForPWA = ev;
        });
     </script>
     */

    constructor() {
        if(window._promptEventForPWA!=null){
            this._promptEvent = window._promptEventForPWA;
            this.eventEmitter.emit(this.installPromptChange, ()=>{this.triggerAddToHomeScreen();});
        }
        window.addEventListener("beforeinstallprompt", ev => {
            console.log("beforeinstallprompt received");
            // Stop Chrome from asking _now_
            this._promptEvent = ev;
            this._promptEvent.preventDefault();
            this.eventEmitter.emit(this.installPromptChange, ()=>{this.triggerAddToHomeScreen();});
        });
        window.addEventListener('appinstalled', (evt) => {
            console.log('appinstalled');
        });
    }

    start(){
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log("PWA service started: running from installed PWA");
        }else{
            console.log("PWA service started: running from browser");
        }
        this.eventEmitter.emit(this.installPromptChange, null);
    }

    triggerAddToHomeScreen = () => {
        if(this._promptEvent!=null){
            this._promptEvent.prompt();
            this._promptEvent.userChoice
                .then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the A2HS prompt');
                    } else {
                        console.log('User dismissed the A2HS prompt');
                    }
                    this._promptEvent = null;
                    this.eventEmitter.emit(this.installPromptChange, null);
                });
        }else {
            console.error("no PWA callback registered");
        }
    }

    on(callback){
        this.eventEmitter.on(pwaService.installPromptChange,callback);
        if(this._promptEvent!=null){
            this.eventEmitter.emit(this.installPromptChange, ()=>{this.triggerAddToHomeScreen();});
        }
        return ()=>{
            this.eventEmitter.off(pwaService.installPromptChange,callback);
        };
    }


    tapped: boolean = true;

}

export let pwaService = new PWAService();