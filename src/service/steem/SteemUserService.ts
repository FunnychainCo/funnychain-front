import {UserServiceInterface} from "../generic/ApplicationInterface";
import {PROVIDER_STEEM, UserEntry} from "../generic/UserEntry";
import {loadUserAvatar} from "./generic/SteemUtils";
import {forceUrlToHttps} from "../ImageUtil";

export class SteemUserService implements UserServiceInterface {

    loadUserData(uid: string): Promise<UserEntry> {
        return new Promise<UserEntry>((resolve, reject) => {
            loadUserAvatar(uid).then((avatarUrl) => {
                resolve({
                    uid: uid,
                    provider:PROVIDER_STEEM,
                    email:"",
                    displayName: uid,
                    avatarUrl: forceUrlToHttps(avatarUrl),
                    wallet:0
                });
            });
        });
    }

}


export let steemUserService = new SteemUserService();
