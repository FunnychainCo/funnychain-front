import {CommentsAction, MemeServiceAction} from "../../generic/ApplicationInterface";
import * as dsteem from "dsteem";
import {constructMemeComment, constructMemePost, makeDelegatedUserDataV1} from "../generic/PostsMaker";
import {getAuthorAndPermalink} from "../generic/SteemUtils";
import {debugService} from "../../debugService";
import {USER_ENTRY_NO_VALUE, UserEntry} from "../../generic/UserEntry";

export class DsteemService implements MemeServiceAction, CommentsAction {
    private dSteemClient: dsteem.Client;
    private accounts: any = {};
    private currentAccount: string;
    private testNetwork: boolean;
    private delegateUserEntry: UserEntry = USER_ENTRY_NO_VALUE;


    start(delegateUserEntry:UserEntry) {
        this.delegateUserEntry = delegateUserEntry;
        this.testNetwork = debugService.testNetwork;
        if (!this.testNetwork) {
            this.dSteemClient = new dsteem.Client('https://api.steemit.com');
            /* Register account */
            //steem private posting key
            this.accounts['steemzealot'] = {
                privateKey: dsteem.PrivateKey.fromString("5KgwVBfMsb8BEygDEuz2W1jz8jpXfqgAjcrcmumVm3hdNBj8g5n")
            };
            this.currentAccount = 'steemzealot';
        } else {
            let opts: any = {};
            //connect to community testnet
            opts.addressPrefix = 'STX';
            opts.chainId = '79276aea5d4877d9a25892eaa01b0adf019d3e5cb12a97478df3298ccdd01673';
            //connect to server which is connected to the network/testnet
            this.dSteemClient = new dsteem.Client('https://testnet.steem.vc', opts);
            /* Register account */
            //steem private posting key
            this.accounts['demo'] = {
                privateKey: dsteem.PrivateKey.fromString("5Jtbfge4Pk5RyhgzvmZhGE5GeorC1hbaHdwiM7pb5Z5CZz2YKUC")
            };
            this.currentAccount = 'demo';
        }
    }

    post(title: string, url: string): Promise<string> {
        if(this.delegateUserEntry===USER_ENTRY_NO_VALUE){
            throw Error("invalid user");
        }
        return new Promise<string>((resolve, reject) => {
            let owner = this.currentAccount;
            let delegatedUserData = makeDelegatedUserDataV1(this.delegateUserEntry.uid, this.delegateUserEntry.displayName, this.delegateUserEntry.avatarUrl);
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
            let privateKey = this.accounts[this.currentAccount].privateKey;
            this.dSteemClient.broadcast.comment(commentData, privateKey).then(commentResult => {
                if (commentResult) {
                    resolve("ok");
                } else {
                    reject("No reult received");
                }
            });
        });
    }

    postComment(parentPostId: string, message: string): Promise<string> {
        if(this.delegateUserEntry===USER_ENTRY_NO_VALUE){
            throw Error("invalid user");
        }
        return new Promise<string>((resolve, reject) => {
            let owner = this.currentAccount;
            let delegatedUserData = makeDelegatedUserDataV1(this.delegateUserEntry.uid, this.delegateUserEntry.displayName, this.delegateUserEntry.avatarUrl);
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
            let privateKey = this.accounts[this.currentAccount].privateKey;
            this.dSteemClient.broadcast.comment(commentData, privateKey).then(commentResult => {
                if (commentResult) {
                    resolve("ok");
                } else {
                    reject("No reult received");
                }
            });
        });
    }

    vote(url: string): Promise<string> {
        if(this.delegateUserEntry===USER_ENTRY_NO_VALUE){
            throw Error("invalid user");
        }
        return new Promise<string>((resolve, reject) => {
            let owner = this.currentAccount;
            let authorAndPermalink = getAuthorAndPermalink(url);
            let privateKey = this.accounts[this.currentAccount].privateKey;
            this.dSteemClient.broadcast.vote({
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

}

export let dsteemActionService = new DsteemService();

