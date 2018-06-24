import {UserServiceInterface} from "../generic/ApplicationInterface";
import {UserEntry} from "../generic/UserEntry";
import {loadUserAvatar} from "./SteemUtils";

export class SteemUserService implements UserServiceInterface {

    loadUserData(uid: string): Promise<UserEntry> {
        return new Promise<UserEntry>((resolve, reject) => {
            loadUserAvatar(uid).then((avatarUrl) => {
                resolve({
                    uid: uid,
                    displayName: uid,
                    avatarUrl: avatarUrl
                });
            });
        });
    }

}


export let steemUserService = new SteemUserService();
