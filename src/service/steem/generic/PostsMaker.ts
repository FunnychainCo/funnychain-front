import {memeService} from "../../generic/MemeService";
import {getAuthorAndPermalink, makePermalinkFromTitle} from "./SteemUtils";

export interface MemeCommentJson {
    title:string,
    tags: string[],
    parentAuthor: string,
    parentPermalink: string,
    commentPermalink: string,
    owner: string,
    message: string,
    jsonMetadata: any
}


export function constructMemeComment(owner:string,parentPostId:string, message: string,jsonMetaData:any):MemeCommentJson{
    let authorAndPermalink = getAuthorAndPermalink(parentPostId);
    let parentAuthor = authorAndPermalink.author;
    let parentPermalink = authorAndPermalink.permalink;
    //20180521t112532375z
    //re-marel-apartment-roomate-zg1hbmlh-hvk3j-20180521t112532375z
    //         apartment-roomate-zg1hbmlh-hvk3j
    let formatedDate = new Date().toISOString().replace(new RegExp("-", 'g'), "").replace(new RegExp(":", 'g'), "").replace("T", "t").replace("Z", "z").replace(".", "");
    let commentPermalink = "re-" + parentAuthor + "-" + parentPermalink + "-" + formatedDate;

    return {
        title:"",
        tags: [],
        parentAuthor: parentAuthor,
        parentPermalink: parentPermalink,
        commentPermalink: commentPermalink,
        owner: owner,
        message: message,
        jsonMetadata: jsonMetaData
    }
}

export interface DelegatedUserDataV1{
    version:string,
    name:string,
    id:string,
    url:string,
    signature:string
}

/**
 * the returned property should be called delegatedOwner in steem json_metadata
 * @param {string} userDispayName
 * @param {string} userAvatarUrl
 * @returns {{}}
 */
export function makeDelegatedUserDataV1(uid:string,userDispayName:string,userAvatarUrl:string):DelegatedUserDataV1{
    return {
        version:"delegated-owner/0.1",
        name:userDispayName,
        id:uid,
        url:userAvatarUrl,
        signature:""
    }
}

export function constructMemePost(owner:string,title: string, url: string, metadata: any): MemeCommentJson {
    /**
     * If you want a post, than parentAuthor is an empty string and parentPermlink is your first tag. You might want to check out any post's jsonMetadata on steemd to see how to do that part.
     The doc also explains the login at the top of the page.
     */
    let tags: string[] = memeService.getTags();
    let parentAuthor = "";
    let parentPermalink = tags[0];
    let commentPermalink = makePermalinkFromTitle(title);
    let urlSplit = url.split("/");
    let message = "![" + urlSplit[urlSplit.length - 1] + "](" + url + ")";
    let jsonMetadata = {
        tags: tags,
        app: "funnychain/0.1",
        image: [url],
        links: [url],
        format: "markdown"
    };
    jsonMetadata = {...jsonMetadata,...metadata};//object merge
    //cat meme body is image markdown => //json_metadata:"{"tags":["meme","funny","tether","cryptocurrencies","dmania"],"image":["https://steemitimages.com/DQmQxfdrfb6ucJtmRDNCYvcf8d4QXq71dcVLmZQtT3JnD77/2ar6h6.jpg"],"app":"steemit/0.1","format":"markdown"}"
    //cat dmania body is html => // json_metadata:"{"tags":["dmania","meme","funny"],"image":["https://s3-eu-west-1.amazonaws.com/dmania-images/cyrmarket-0oh7nq4.jpg"],"app":"dmania/0.7"}"
    console.log("meme post =>" + parentAuthor + " => " + parentPermalink + " => " + commentPermalink + " => " + owner + " => " + message + " => ", jsonMetadata);
    return {
        title:title,
        tags: tags,
        parentAuthor: parentAuthor,
        parentPermalink: parentPermalink,
        commentPermalink: commentPermalink,
        owner: owner,
        message: message,
        jsonMetadata: jsonMetadata
    }
}
