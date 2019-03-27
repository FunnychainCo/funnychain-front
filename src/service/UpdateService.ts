import store from 'store';
import {userNotificationService} from "./notification/UserNotificationService";

const updateNeededStorekey = "fc.update.needed";

export class UpdateService {

    checkUpdate(){
        if(store.get(updateNeededStorekey,false)){
            this.performUpdate();
        }
    }

    setUpdateFlag(){
        userNotificationService.sendNotificationMessageToUser({text:"New version available!",type:"update",date:new Date().getTime()});
        store.set(updateNeededStorekey, true);
    }

    performUpdate(){
        console.log("perform update");
        store.set(updateNeededStorekey, false);
        document.location.reload(true);//TODO reload deprecated
    }
}

export let updateService = new UpdateService();