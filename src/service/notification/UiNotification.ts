import {Message} from "./UserNotificationService";

export class UiNotification {
    visible: boolean = true;
    callback: (message: Message) => void = (message) => {
    };

    start() {
        document.addEventListener("visibilitychange", () => {
            this.visible = document.visibilityState === 'visible';
        });
    }

    setUiCallBackForNotification(callback: (message: Message) => void) {
        this.callback = callback;
    }

    uiVisible(): boolean {
        return this.visible;
    }

    sendNotificationToUser(message: Message) {
        this.callback(message);
    }
}
