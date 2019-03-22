///////////////////
// MEDIA
///////////////////
export const DATABASE_MEDIA = "media";

export interface MediaEntry {
    uid: string,
    url: string
}

///////////////////
// MEME
///////////////////
export const DATABASE_MEMES = "memes";

export interface MemeDBEntry {
    memeIpfsHash: string,
    uid: string,
    hot: number,
    created: number,
    value: number,
}

export interface MemeDBStruct {
    [id: string]: MemeDBEntry // id => meme id
}

///////////////////
// NOTIFICATION
///////////////////
export const DATABASE_NOTIFICATIONS = "notifications";
export interface DBNotification {
    title:string,
    uid:string,
    icon:string,
    text:string,
    action:string,
    date:number,
    seen:boolean
}

export interface NotificationDBEntry {
    notifications:{[id: string]: DBNotification}
}

export interface NotificationDBStruct {
    [id: string]: NotificationDBEntry // id => user id
}

///////////////////
// USER
///////////////////
export const DATABASE_USERS = "users";
export const DATABASE_CACHE_USERS = "cache/users";

export interface UserDBEntry {
    uid: string,
    email: string,
    displayName: string,
    avatarIid: string,//ipfs hash
    wallet: {
        balance: number,
        lastUpdate: number
    },
    notifications:{[id: string]: DBNotification}
}

export interface UserDBStruct {
    [id: string]: UserDBEntry // id => user id
}

///////////////////
// META
///////////////////
export const CACHE_DATABASE_META = "cache/meta";

export interface MetaDBEntry {
    hotest: {
        hash: string,
        date: number
    },
    bet_pool: {
        balance: number,
        lastUpdate: number
    }
}

///////////////////
// COMMENTS
///////////////////
export const DATABASE_COMMENTS = "comments";
export const DATABASE_CACHE_COMMENTS = "cache/comments";

export interface CommentDBEntry {
    date: number,
    message: string,
    uid: string
}

export interface CommentDBStruct {
    [id: string]: {
        [id: string]: CommentDBEntry // id => comment id
    }// id => meme id
}

///////////////////
// BETS
///////////////////
export const DATABASE_BETS = "bets";

export interface BetDBStruct {
    [id: string]: { // id => meme id
        [id: string]: number
    }// id => user id
}

///////////////////
// UPVOTES
///////////////////

export const DATABASE_UPVOTES = "upvotes";

export interface UpvoteDBStruct {
    [id: string]: {// id => meme id
        [id: string]: number
    }// id => user id
}

///////////////////
// TRANSACTION
///////////////////
export const DATABASE_TRANSACTIONS = "transactions_V2";

export interface TransactionDBEntry {
    amount: number,
    dst: string,
    src: string,
    date:number
}

export interface TransactionDBStruct {
    [id: string]: TransactionDBEntry
}

export let rules = {
    "rules": {
        ".read": "true",
        "transactions": {
            "$key": {
                ".indexOn": ["dst", "src"]
            }
        },
        "memes": {
            ".write": "true",
            ".indexOn": ["created", "hot"]
        },
        "comments": {
            ".write": "true",
        },
        "users": {
            "$user_id": {
                ".write": "$user_id === auth.uid",
            }
        }
    }
};

///////////////////
// DB
///////////////////
export interface DB {
    DATABASE_MEMES: MemeDBStruct,
    DATABASE_USERS: UserDBStruct,
    DATABASE_META: MetaDBEntry,
    DATABASE_COMMENTS: CommentDBStruct,
    DATABASE_BETS: BetDBStruct,
    DATABASE_UPVOTES: UpvoteDBStruct,
    DATABASE_TRANSACTIONS: TransactionDBStruct,
    DATABASE_NOTIFICATION : NotificationDBStruct,
}
