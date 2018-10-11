
export const DATABASE_MEDIA = "media";
export interface MediaEntry {
    uid: string,
    url: string
}

export const DATABASE_MEMES = "memes";
export interface FirebaseMeme {
    memeIpfsHash: string,
    uid: string,
    created: number,
    value: number,
}

export const DATABASE_USERS = "users";
export interface FirebaseUser {
    uid: string,
    email:string,
    displayName:string,
    avatarIid:string,//ipfs hash
    wallet:{
        balance:number,
        lastUpdate:number
    }
}

export const DATABASE_COMMENTS = "comments";

export const DATABASE_BETS = "bets";

export const DATABASE_UPVOTES = "upvotes";

export const DATABASE_HOTS = "hots";

export const DATABASE_TRANSACTIONS = "transactions";