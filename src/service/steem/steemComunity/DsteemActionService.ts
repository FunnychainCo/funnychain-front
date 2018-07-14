import {CommentsAction, MemeServiceAction} from "../../generic/ApplicationInterface";
import {constructMemeComment, constructMemePost, makeDelegatedUserDataV1} from "../generic/PostsMaker";
import {getAuthorAndPermalink} from "../generic/SteemUtils";
import {USER_ENTRY_NO_VALUE} from "../../generic/UserEntry";
import {steemCommunityAccountService} from "./SteemCommunityAccountService";
import {firebaseUpvoteService} from "../../firebase/FirebaseUpvoteService";

export class DsteemService implements MemeServiceAction, CommentsAction {

    post(title: string, url: string): Promise<string> {
        if(steemCommunityAccountService.delegateUserEntry===USER_ENTRY_NO_VALUE){
            throw Error("invalid user");
        }
        return new Promise<string>((resolve, reject) => {
            let owner = steemCommunityAccountService.currentAccount;
            let delegateUserEntry = steemCommunityAccountService.delegateUserEntry;
            let delegatedUserData = makeDelegatedUserDataV1(delegateUserEntry.uid, delegateUserEntry.displayName, delegateUserEntry.avatarUrl);
            let memePostJson = constructMemePost(owner, title, url, {delegatedOwner: delegatedUserData});
            let commentData = {
                parent_author: memePostJson.parentAuthor,
                parent_permlink: memePostJson.parentPermalink,
                author: memePostJson.owner,
                permlink: memePostJson.commentPermalink,
                title: memePostJson.title,
                body: memePostJson.message,
                json_metadata: JSON.stringify(memePostJson.jsonMetadata)
            };
            let privateKey = steemCommunityAccountService.accounts[steemCommunityAccountService.currentAccount].privateKey;
            steemCommunityAccountService.dSteemClient.broadcast.comment(commentData, privateKey).then(commentResult => {
                if (commentResult) {
                    resolve("ok");
                } else {
                    reject("No reult received");
                }
            });
        });
    }

    postComment(parentPostId: string, message: string): Promise<string> {
        if(steemCommunityAccountService.delegateUserEntry===USER_ENTRY_NO_VALUE){
            throw Error("invalid user");
        }
        return new Promise<string>((resolve, reject) => {
            let owner = steemCommunityAccountService.currentAccount;
            let delegateUserEntry = steemCommunityAccountService.delegateUserEntry;
            let delegatedUserData = makeDelegatedUserDataV1(delegateUserEntry.uid, delegateUserEntry.displayName, delegateUserEntry.avatarUrl);
            let memePostJson = constructMemeComment(owner, parentPostId, message, {delegatedOwner: delegatedUserData});
            let commentData = {
                parent_author: memePostJson.parentAuthor,
                parent_permlink: memePostJson.parentPermalink,
                author: memePostJson.owner,
                permlink: memePostJson.commentPermalink,
                title: memePostJson.title,
                body: memePostJson.message,
                json_metadata: JSON.stringify(memePostJson.jsonMetadata)
            };
            let privateKey = steemCommunityAccountService.accounts[steemCommunityAccountService.currentAccount].privateKey;
            steemCommunityAccountService.dSteemClient.broadcast.comment(commentData, privateKey).then(commentResult => {
                if (commentResult) {
                    resolve("ok");
                } else {
                    reject("No reult received");
                }
            });
        });
    }

    performSteemCommunityVote(url: string):Promise<string>{
        return new Promise<string>((resolve, reject) => {
            let owner = steemCommunityAccountService.currentAccount;

            let authorAndPermalink = getAuthorAndPermalink(url);
            let privateKey = steemCommunityAccountService.accounts[steemCommunityAccountService.currentAccount].privateKey;
            steemCommunityAccountService.dSteemClient.broadcast.vote({
                author: authorAndPermalink.author,
                permlink: authorAndPermalink.permalink,
                voter: owner,
                weight: 10000 //10000 <= max
            }, privateKey).then(VoteResult => {
                if (VoteResult) {
                    resolve("ok");
                } else {
                    reject("vote fail");
                }
            });
        });
    }

    vote(url: string): Promise<string> {
        if(steemCommunityAccountService.delegateUserEntry===USER_ENTRY_NO_VALUE){
            throw Error("invalid user");
        }
        return new Promise<string>(resolve => {
            let delegatedUserId = steemCommunityAccountService.delegateUserEntry.uid;
            firebaseUpvoteService.vote(url,delegatedUserId).then(value => {
                this.performSteemCommunityVote(url).then(value1 => {
                    resolve("ok");
                }).catch(reason => {
                    //we do not care if this fail the firebase vote s the important one for the community
                    resolve("ok");
                })
            });
        })
    }

}

export let dsteemActionService = new DsteemService();

