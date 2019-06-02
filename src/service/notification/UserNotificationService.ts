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
import {isBrowserRenderMode} from "../ssr/windowHelper";
import {PaginationCursorFactory} from "../concurency/PaginationCursorFactory";
import {ItemLoader} from "../concurency/PaginationInterface";

export interface Message {
    text: string,
    type: string,
    date: number,
}

export class UserNotificationService {
    uiNotification: UiNotification;
    oneSignalNotification: any;//TODO interface
    uid: string = "";
    unseenNotificationNumber: number = 0;
    private eventEmitter = new EventEmitter();
    public notificationPaginationCursorFactory = new PaginationCursorFactory();
    itemLoader: ItemLoader<UiNotificationData>;
    data: { [id: string]: UiNotificationData } = {};

    start() {

        let API_KEY = GLOBAL_PROPERTIES.ONE_SIGNAL_API_KEY();
        let ANDROID_ID = GLOBAL_PROPERTIES.ONE_SIGNAL_ANDROID_NUMBER();

        this.uiNotification = new UiNotification();
        if (isBrowserRenderMode()) {
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
        this.itemLoader = this.createItemLoader();
    }

    private createItemLoader(): ItemLoader<UiNotificationData> {
        let self = this;
        return new class implements ItemLoader<UiNotificationData> {
            onData(callback: (id: string, data: UiNotificationData) => void): () => void {
                self.eventEmitter.on("new_item", callback);
                return () => {
                    self.eventEmitter.off("new_item", callback);
                };
            }

            requestItem(id: string) {
                self.eventEmitter.emit("new_item", id, self.data[id]);
            }
        }
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

    synchronize(uid: string) {
        this.uid = uid;
        if (uid && uid !== "") {
            axios.get(GLOBAL_PROPERTIES.NOTIFICATION_SERVICE_GET_ALL() + uid, {}).then((response) => {
                let map: { [id: string]: DBNotification } = response.data;
                let data = {};//reset data
                let order = [];
                Object.keys(map).forEach(key => {
                    data[key] = this.convertDbNotificationToUiNotification(map[key], key), order.push(key);
                    this.data[key] = data[key];
                    this.eventEmitter.emit("new_item", key, this.data[key]);
                });
                //TODO sort on server
                order.sort((a, b) => {
                    return data[b].date.getTime() - data[a].date.getTime();
                });
                order.forEach(value => {
                    this.notificationPaginationCursorFactory.addKeyBottom(value);
                });
            }).catch(reason => {
                audit.error(reason);
            });
        }
    }

    //service worker server / app closed part
    updateNotification(uid: string): void {
        this.uid = uid;
        if (this.uid && this.uid !== "") {
            this.unseenNotificationNumber = 0;
            this.synchronize(uid);
            this.oneSignalNotification.onNewNotificationFromServiceWorker(data => {
                let hash = data.hash;
                axios.get(GLOBAL_PROPERTIES.NOTIFICATION_SERVICE_GET() + this.uid + "/" + hash, {}).then((response) => {
                    let notif: DBNotification = response.data;
                    let notifConverted = this.convertDbNotificationToUiNotification(notif, hash);
                    this.data[hash] = notifConverted;
                    this.notificationPaginationCursorFactory.addKeyTop(hash);
                    this.eventEmitter.emit("new_item", hash, this.data[hash]);
                }).catch(reason => {
                    audit.error(reason);
                });
            });
            this.updateUnseenNumber();
        }
        if (this.oneSignalNotification) {
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
