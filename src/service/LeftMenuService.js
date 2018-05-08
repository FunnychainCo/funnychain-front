export class LeftMenuService {
    callback = null;

    registerOpeningCallBack(callback) {
        this.callback = callback;
    }

    requestOpening() {
        this.callback();
    }
}

export var leftMenuService = new LeftMenuService();