//import {steemCommentService} from "../steem/SteemCommentsService";
import {CommentServiceInterface, CommentsVisitor} from "./ApplicationInterface";
import {firebaseCommentService} from "../firebase/FirebaseCommentService";

export class CommentService implements CommentServiceInterface {

    getCommentVisitor(id): CommentsVisitor {
        return firebaseCommentService.getCommentVisitor(id);
    }

}

export let commentService = new CommentService();