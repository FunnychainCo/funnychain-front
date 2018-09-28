import {
    CommentServiceInterface, CommentsVisitor
} from "../generic/ApplicationInterface";
import {MemeComment} from "../generic/MemeComment";
import {DATABASE_COMMENTS} from "./shared/FireBaseDBDefinition";

export class FirebaseCommentService implements CommentServiceInterface{
    getCommentVisitor(id): CommentsVisitor {
        return new FireBaseCommentVisitor(id);
    }

    storageBase = DATABASE_COMMENTS;

}

export class FireBaseCommentVisitor implements CommentsVisitor{
    constructor(id:string){

    }

    on(callback: (comments: MemeComment[]) => void): () => void {
        return ()=>{};
    }

    refresh(): Promise<string> {
        return Promise.resolve("not implemented");
    }

    loadMore(limit: number) {
    }

}

export let firebaseCommentService = new FirebaseCommentService();
