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

export interface FirebaseMeme {
    memeIpfsHash: string,
    uid: string,
    hot: number,
    created: number,
    value: number,
}

export interface FirebaseMemeDBStruct {
    [id: string]: FirebaseMeme // id => meme id
}

///////////////////
// USER
///////////////////
export const DATABASE_USERS = "users";

export interface FirebaseUser {
    uid: string,
    email: string,
    displayName: string,
    avatarIid: string,//ipfs hash
    wallet: {
        balance: number,
        lastUpdate: number
    }
}

export interface FirebaseUserDBStruct {
    [id: string]: FirebaseUser // id => user id
}

///////////////////
// META
///////////////////
export const DATABASE_META = "meta";

export interface FirebaseMeta {
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

export interface FirebaseComment {
    date: number,
    message: string,
    uid: string
}

///////////////////
// BETS
///////////////////
export const DATABASE_BETS = "bets";

export interface FirebaseBetDBStruct {
    [id: string]: { // id => meme id
        [id: string]: number
    }// id => user id
}

///////////////////
// UPVOTES
///////////////////

export const DATABASE_UPVOTES = "upvotes";

export interface FirebaseUpvoteDBStruct {
    [id: string]: {// id => meme id
        [id: string]: number
    }// id => user id
}

///////////////////
// TRANSACTION
///////////////////
export const DATABASE_TRANSACTIONS = "transactions_V2";

export interface FirebaseTransaction {
    amount: number,
    dst: string,
    src: string,
    date:number
}

export interface FirebaseTransactionDBStruct {
    [id: string]: FirebaseTransaction
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
    DATABASE_MEMES: FirebaseMemeDBStruct,
    DATABASE_USERS: FirebaseUserDBStruct,
    DATABASE_META: FirebaseMeta
    DATABASE_COMMENTS: any
    DATABASE_BETS: FirebaseBetDBStruct,
    DATABASE_UPVOTES: FirebaseUpvoteDBStruct,
    DATABASE_TRANSACTIONS: FirebaseTransactionDBStruct,
}
