import {steemCommentService} from "../steem/SteemCommentsService";
import {CommentServiceInterface, CommentsVisitor} from "./ApplicationInterface";

export class CommentService implements CommentServiceInterface{

    getCommentVisitor(id): CommentsVisitor {
        return steemCommentService.getCommentVisitor(id);
    }
}

export let commentService = new CommentService();