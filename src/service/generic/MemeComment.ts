import {USER_ENTRY_NO_VALUE, UserEntry} from "./UserEntry";

/**
 * MEME SERVICE
 */

export interface MemeComment {
    id: string,
    date: Date,
    parentId: string,
    author: UserEntry,
    text: string,
    flagged: boolean
}

class ImmutableMemeComment implements MemeComment{
    readonly id= "";
    readonly date= new Date(0);
    readonly parentId= "";
    readonly author= USER_ENTRY_NO_VALUE;
    readonly text= "";
    readonly flagged = true;
}
export const MEME_COMMENT_NO_VALUE: ImmutableMemeComment = Object.freeze(new ImmutableMemeComment());