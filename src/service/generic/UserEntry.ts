export interface UserEntry {
    uid: string,
    provider: string,
    email: string,
    displayName: string,
    avatarUrl: string,
}

export const PROVIDER_STEEM_CONNECT:string = "Steem/Connect";
export const PROVIDER_STEEM:string = "Steem";
export const PROVIDER_FIREBASE_MAIL:string = "Firebase/mail";

class ImmutableUserEntry implements UserEntry{
    readonly uid = "";
    readonly provider = "";
    readonly email = "";
    readonly displayName = "";
    readonly avatarUrl = "";
}

export const USER_ENTRY_NO_VALUE: ImmutableUserEntry = Object.freeze(new ImmutableUserEntry());
