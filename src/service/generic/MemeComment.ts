import {UserEntry,USER_ENTRY_NO_VALUE} from "./UserEntry";

/**
 * MEME SERVICE
 */

export interface MemeComment {
    id: string,
    parentId: string,
    author: UserEntry,
    text: string,
    flagged: boolean
}

class ImmutableMemeComment implements MemeComment{
    readonly id= "";
    readonly parentId= "";
    readonly author= USER_ENTRY_NO_VALUE;
    readonly text= "";
    readonly flagged = true;
}
export const MEME_COMMENT_NO_VALUE: ImmutableMemeComment = Object.freeze(new ImmutableMemeComment());