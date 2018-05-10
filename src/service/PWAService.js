import EventEmitter from "eventemitter3/index";

export class PWAService {
    pwaAddToScreenCallBack = () => {
        console.error("no PWA callback registered")
    };

    installPromptChange = 'PWAService.installpromptchange';
    eventEmitter = new EventEmitter();

    constructor() {
        /*window.addEventListener("beforeinstallprompt", ev => {
            console.log("beforeinstallprompt received");
            // Stop Chrome from asking _now_
            ev.preventDefault();

            // Create your custom "add to home screen" button here if needed.
            // Keep in mind that this event may be called multiple times,
            // so avoid creating multiple buttons!
            this.pwaAddToScreenCallBack = () => {
                ev.prompt();
                ev.userChoice
                    .then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted the A2HS prompt');
                        } else {
                            console.log('User dismissed the A2HS prompt');
                        }
                        ev = null;
                        this.eventEmitter.emit(this.installPromptChange, null);
                    });
            }
            this.eventEmitter.emit(this.installPromptChange, ()=>{this.triggerAddToHomeScreen();});
        });*/
        window.addEventListener('appinstalled', (evt) => {
            console.log('appinstalled');
        });
    }

    start(){
        console.log("PWA service started");
        this.eventEmitter.emit(this.installPromptChange, null);
    }

    triggerAddToHomeScreen = () => {
        this.pwaAddToScreenCallBack();
    }

    getEmitter(){
        return this.eventEmitter;
    }

}

export var pwaService = new PWAService();