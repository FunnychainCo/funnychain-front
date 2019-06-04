import {UiNotification} from "./UiNotification";
import {OneSignalNotificationWebSDK} from "./OneSignalNotificationWebSDK";
import {ionicMobileAppService} from "../mobile/IonicMobileAppService";
import {OneSignalNotificationMobileSDK} from "./OneSignalNotificationMobileSDK";
import {GLOBAL_PROPERTIES} from "../../properties/properties";
import {audit} from "../log/Audit";
import EventEmitter from "eventemitter3";
import {UiNotificationData} from "../generic/Notification";
import {DBNotification} from "../database/shared/DBDefinition";
import {isBrowserRenderMode} from "../ssr/windowHelper";
import {PaginationCursorFactory} from "../concurency/PaginationCursorFactory";
import {ItemLoader} from "../concurency/PaginationInterface";
import {notificationDatabase} from "../database/NotificationDatabase";
import {idleTaskPoolExecutor} from "../generic/IdleTaskPoolExecutorService";

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
    public notificationPaginationCursorFactory;
    itemLoader: ItemLoader<UiNotificationData>;
    data: { [id: string]: UiNotificationData } = {};

    started = false;
    start() {
        if(this.started){
            return;
        }
        this.started = true;
        ///
        this.notificationPaginationCursorFactory = new PaginationCursorFactory();
        this.notificationPaginationCursorFactory.onRequestMore((key:string,number: number,direction?:string)=>{
            idleTaskPoolExecutor.addTask(()=>{
                notificationDatabase.getNotificationorderByDate(this.uid, key, number).then(notifications => {
                    let adds = [];
                    notifications.forEach(notification => {
                        this.data[notification.id] = this.convertDbNotificationToUiNotification(notification, notification.id);
                        adds.push(notification.id);
                        this.eventEmitter.emit("new_item", notification.id, this.data[notification.id]);
                    });
                    this.notificationPaginationCursorFactory.addKeysBottom(adds);
                })
            });
        });
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
        return value;
    }

    updateUnseenNumber() {
        notificationDatabase.updateUnseenNumber(this.uid).then(value => {
            this.eventEmitter.emit("change", value);
        });
    }

    markAllAsSeen(): void {
        notificationDatabase.markAllAsSeen(this.uid);
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

    //service worker server / app closed part
    updateNotification(uid: string): void {
        this.uid = uid;
        if (this.uid && this.uid !== "") {
            this.unseenNotificationNumber = 0;
            this.oneSignalNotification.onNewNotificationFromServiceWorker(data => {
                let hash = data.hash;
                notificationDatabase.getNotification(this.uid, hash).then(notif => {
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
