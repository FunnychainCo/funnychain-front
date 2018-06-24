export interface UserEntry {
    uid: string,
    displayName: string,
    avatarUrl: string,
}

export const USER_ENTRY_NO_VALUE: UserEntry = {
    uid: "",
    displayName: "",
    avatarUrl: "",
};
