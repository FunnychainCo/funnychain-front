import axios from "axios";
import {GLOBAL_PROPERTIES} from "../../properties/properties";
import {DBNotification} from "./shared/DBDefinition";

const SERVICE = {
    PUSH_NOTIFICATION_SERVICE_SUBSCRIBE: () => GLOBAL_PROPERTIES.PUSH_NOTIFICATION_SERVICE() + "/subscribe/",
    NOTIFICATION_SERVICE_MARK_SEEN: () => GLOBAL_PROPERTIES.NOTIFICATION_SERVICE() + "/mark/seen/",///mark/seen/:uid/:hash/
    NOTIFICATION_SERVICE_UNSEEN_NUMBER: () => GLOBAL_PROPERTIES.NOTIFICATION_SERVICE() + "/unseen/number/",// /unseen/number/:uid/
    NOTIFICATION_SERVICE_CLEAR: () => GLOBAL_PROPERTIES.NOTIFICATION_SERVICE() + "/clear/",// /clear/:uid/:hash
    NOTIFICATION_SERVICE_GET_ALL: () => GLOBAL_PROPERTIES.NOTIFICATION_SERVICE() + "/notifications/",// /notifications/:uid/
    NOTIFICATION_SERVICE_GET: () => GLOBAL_PROPERTIES.NOTIFICATION_SERVICE() + "/notification/",// /notification/:uid/:hash
}

export class NotificationDatabase {

    updateUnseenNumber(uid: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!uid || uid === "") {
                reject("invalid uid");
                return;
            }
            axios.get(SERVICE.NOTIFICATION_SERVICE_UNSEEN_NUMBER() + uid, {}).then((response) => {
                resolve(response.data);
            }).catch(reason => {
                reject(reason);
            });
        })
    }

    markAllAsSeen(uid: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!uid || uid === "") {
                reject("invalid uid");
                return;
            }
            axios.get(SERVICE.NOTIFICATION_SERVICE_MARK_SEEN() + uid + "/" + "all", {}).then((response) => {
                resolve(response.data);
            }).catch(reason => {
                reject(reason);
            });
        })
    }

    getAllNotifications(uid: string): Promise<{ [id: string]: DBNotification }> {
        return new Promise<{ [id: string]: DBNotification }>((resolve, reject) => {
            if (!uid || uid === "") {
                reject("invalid uid");
                return;
            }
            axios.get(SERVICE.NOTIFICATION_SERVICE_GET_ALL() + uid, {}).then((response) => {
                let map: { [id: string]: DBNotification } = response.data;
                resolve(map);
            }).catch(reason => {
                reject(reason);
            });
        })
    }

    getNotificationorderByDate(uid: string, afterNotificationId: string, limit: number): Promise<DBNotification[]> {
        return new Promise<DBNotification[]>((resolve, reject) => {
            if (!uid || uid === "") {
                reject("invalid uid");
                return;
            }
            axios.post(GLOBAL_PROPERTIES.NOTIFICATION_SERVICE() + "/notificationsOrderByDate/",{
                afterNotificationId:afterNotificationId,
                uid:uid,
                limit:limit,
            } ).then((response) => {
                let notif: DBNotification[] = response.data;
                resolve(notif);
            }).catch(reason => {
                reject(reason);
            });
        })
    }

    getNotification(uid: string, notificationId: string): Promise<DBNotification> {
        return new Promise<DBNotification>((resolve, reject) => {
            if (!uid || uid === "") {
                reject("invalid uid");
                return;
            }
            if (!notificationId || notificationId === "") {
                reject("invalid notificationId");
                return;
            }
            axios.get(SERVICE.NOTIFICATION_SERVICE_GET() + uid + "/" + notificationId, {}).then((response) => {
                let notif: DBNotification = response.data;
                resolve(notif);
            }).catch(reason => {
                reject(reason);
            });
        })
    }

}

export let notificationDatabase = new NotificationDatabase();

