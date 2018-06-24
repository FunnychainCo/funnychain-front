import {MemeLinkInterface, MemeLoaderInterface, MemeServiceInterface} from "../generic/ApplicationInterface";
import {getAuthorAndPermalink} from "./SteemUtils";
import {steemAuthService} from "./SteemAuthService";
import {idService} from "../IdService";
import {memeService} from "../generic/MemeService";
import {MemeLoader} from "./MemeLoader";
import {MemeLink} from "./MemeLink";

export class SteemMemeService implements MemeServiceInterface {
    getMemeLoader(type: string, tags: string[]): MemeLoaderInterface {
        return new MemeLoader(type, tags);
    }

    getMemeLink(id: string): MemeLinkInterface{
        return new MemeLink(id);
    }

    replaceAll(target, search, replacement) {
        return target.replace(new RegExp(search, 'g'), replacement);
    };

    makePermalinkFromTitle(title: string): string {
        title = title.toLowerCase();
        title = this.replaceAll(title, " ", "-");
        title = this.replaceAll(title, "\t", "-");
        title = this.replaceAll(title, "\n", "-");
        title = this.replaceAll(title, "\r", "-");
        title = this.replaceAll(title, "\b", "-");
        title = this.replaceAll(title, "\f", "-");
        title = title.replace(/[^a-zA-Z]/, "");
        return title + idService.makeidAlpha(6).toLowerCase();
    }



    post(title: string, url: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            /**
             * If you want a post, than parentAuthor is an empty string and parentPermlink is your first tag. You might want to check out any post's jsonMetadata on steemd to see how to do that part.
             The doc also explains the login at the top of the page.
             */
            let tags: string[] = memeService.getTags();
            let parentAuthor = "";
            let parentPermalink = tags[0];
            let commentPermalink = this.makePermalinkFromTitle(title);
            let owner = steemAuthService.currentUser.uid;
            let urlSplit = url.split("/");
            let message = "![" + urlSplit[urlSplit.length - 1] + "](" + url + ")";
            let jsonMetadata = {
                tags: tags,
                app:"funnychain/0.1",
                image: [url],
                links: [url],
                format: "markdown"
            };
            //cat meme body is image markdown => //json_metadata:"{"tags":["meme","funny","tether","cryptocurrencies","dmania"],"image":["https://steemitimages.com/DQmQxfdrfb6ucJtmRDNCYvcf8d4QXq71dcVLmZQtT3JnD77/2ar6h6.jpg"],"app":"steemit/0.1","format":"markdown"}"
            //cat dmania body is html => // json_metadata:"{"tags":["dmania","meme","funny"],"image":["https://s3-eu-west-1.amazonaws.com/dmania-images/cyrmarket-0oh7nq4.jpg"],"app":"dmania/0.7"}"
            console.log("meme post =>" + parentAuthor + " => " + parentPermalink + " => " + commentPermalink + " => " + owner + " => " + message + " => ", jsonMetadata);
            steemAuthService.sc2Api.comment(parentAuthor, parentPermalink, owner, commentPermalink, title, message, jsonMetadata,
                (err, res) => {
                    if (res != null) {
                        console.log("message posted", res);
                        resolve("ok");
                    } else {
                        console.error(err);
                        reject(err);
                    }
                });
            resolve("ok");
        });
    }

    vote(url: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let voter = steemAuthService.currentUser.uid;
            let authorAndPermalink = getAuthorAndPermalink(url);
            steemAuthService.sc2Api.vote(voter, authorAndPermalink.author, authorAndPermalink.permalink, 10000,
                (err, res) => {
                    if (res != null) {
                        resolve("ok");
                    } else {
                        console.error(err);
                        reject(err);
                    }
                });
        });
    }

}

export let steemMemeService = new SteemMemeService();
