export class UserNotificationService {
    callback = (message) => {
    };

    registerCallBack(callback) {
        this.callback = callback;
    }

    notifyUser(message) {
        console.warn(message);
        this.callback(message);
    }

}

export var userNotificationService = new UserNotificationService();
