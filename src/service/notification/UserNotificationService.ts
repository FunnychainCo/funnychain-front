import {UiNotification} from "./UiNotification";
import {OneSignalNotificationWebSDK} from "./OneSignalNotificationWebSDK";
import {ionicMobileAppService} from "../mobile/IonicMobileAppService";
import {OneSignalNotificationMobileSDK} from "./OneSignalNotificationMobileSDK";
import {GLOBAL_PROPERTIES} from "../../properties/properties";
import axios from 'axios'
import {audit} from "../log/Audit";
import EventEmitter from "eventemitter3";
import {UiNotificationData} from "../generic/Notification";
import {DBNotification} from "../database/shared/DBDefinition";
import {RemoteSortedHashSet} from "../concurency/RemoteSortedHashSet";
import {isBrowserRenderMode} from "../ssr/windowHelper";

export interface Message {
    text: string,
    type: string,
    date: number,
}

export class UserNotificationService {
    uiNotification: UiNotification;
    oneSignalNotification: any;//TODO interface
    uid: string = "";
    public notifications: RemoteSortedHashSet<UiNotificationData> = new RemoteSortedHashSet();
    unseenNotificationNumber: number = 0;
    private eventEmitter = new EventEmitter();

    start() {

        let API_KEY = GLOBAL_PROPERTIES.ONE_SIGNAL_API_KEY();
        let ANDROID_ID = GLOBAL_PROPERTIES.ONE_SIGNAL_ANDROID_NUMBER();

        this.uiNotification = new UiNotification();
        if(isBrowserRenderMode()) {
            if (ionicMobileAppService.mobileapp) {
                this.oneSignalNotification = new OneSignalNotificationMobileSDK(API_KEY, ANDROID_ID);
                this.oneSignalNotification.start();
            } else {
                this.oneSignalNotification = new OneSignalNotificationWebSDK(API_KEY);
                this.oneSignalNotification.start();
            }
            this.oneSignalNotification.onNewNotificationFromServiceWorker(data => {
                this.sendNotificationToUser(data.message);
            });
        }
    }

    updateUnseenNumber() {
        axios.get(GLOBAL_PROPERTIES.NOTIFICATION_SERVICE_UNSEEN_NUMBER() + this.uid, {}).then((response) => {
            this.eventEmitter.emit("change", response.data);
        }).catch(reason => {
            audit.error(reason);
        });
    }

    markAllAsSeen(): void {
        if (!this.uid || this.uid === "") {
            return;
        }
        axios.get(GLOBAL_PROPERTIES.NOTIFICATION_SERVICE_MARK_SEEN() + this.uid + "/" + "all", {}).then((response) => {
            this.notifications.refresh();
        }).catch(reason => {
            audit.error(reason);
        });
    }

    onUnseenNumberChange(callback: (number: number) => void): () => void {
        this.eventEmitter.on("change", callback);
        callback(this.unseenNotificationNumber);
        return () => {
            this.eventEmitter.off("change", callback);
        };
    }

    //ui part
    sendNotificationToUser(message: string): void {
        this.uiNotification.sendNotificationToUser({text: message, type: "text", date: new Date().getTime()});
    }

    sendNotificationMessageToUser(message: Message): void {
        this.uiNotification.sendNotificationToUser(message);
    }

    setUiCallBackForNotification(callback: (message: Message) => void): void {
        this.uiNotification.setUiCallBackForNotification(callback);
    }

    convertDbNotificationToUiNotification(value: DBNotification, hash: string): UiNotificationData {
        return {
            hash: hash,
            title: value.title,
            uid: value.uid,
            action: value.action,
            icon: value.icon,
            text: value.text,
            date: new Date(value.date),
            seen: value.seen
        }
    }

    //service worker server / app closed part
    updateNotification(uid: string): void {
        this.uid = uid;
        if (this.uid && this.uid !== "") {
            this.unseenNotificationNumber = 0;
            this.notifications.setSortFunction((a, b) => {
                return b.date.getTime() - a.date.getTime();
            });
            this.notifications.setLoadDataCallback(() => {
                axios.get(GLOBAL_PROPERTIES.NOTIFICATION_SERVICE_GET_ALL() + this.uid, {}).then((response) => {
                    let map: { [id: string]: DBNotification } = response.data;
                    Object.keys(map).forEach(key => {
                        this.notifications.addOrUpdateToList({
                            data: this.convertDbNotificationToUiNotification(map[key], key),
                            hash:key
                        });
                    });
                }).catch(reason => {
                    audit.error(reason);
                });
            });

            this.oneSignalNotification.onNewNotificationFromServiceWorker(data => {
                let hash = data.hash;
                axios.get(GLOBAL_PROPERTIES.NOTIFICATION_SERVICE_GET() + this.uid + "/" + hash, {}).then((response) => {
                    let notif: DBNotification = response.data;
                    this.notifications.addOrUpdateToList({
                        data: this.convertDbNotificationToUiNotification(notif, hash),
                        hash:hash
                    })
                }).catch(reason => {
                    audit.error(reason);
                });
            });
            this.updateUnseenNumber();
        }
        if(this.oneSignalNotification) {
            this.oneSignalNotification.updateNotification(uid);
        }
    }

    onNotificationState(callback: (granted: boolean) => void): () => void {
        return this.oneSignalNotification.onNotificationState(callback);
    }

    setNotificationState(granted: boolean): void {
        this.oneSignalNotification.setNotificationState(granted);
    }
}

export let userNotificationService = new UserNotificationService();
