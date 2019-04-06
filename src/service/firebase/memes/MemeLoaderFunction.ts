import {UserEntry} from "../../generic/UserEntry";
import {IPFSMeme, Meme} from "../../generic/Meme";
import axios from 'axios'
import {ipfsFileUploadService} from "../../uploader/IPFSFileUploadService";
import {userService} from "../../generic/UserService";
import {firebaseCommentService} from "../FirebaseCommentService";
import {upvoteService} from "../../generic/UpvoteService";
import {MemeDBEntry} from "../../database/shared/DBDefinition";
import {firebaseBetService} from "../FirebaseBetService";
import {authService} from "../../generic/AuthService";
import {imageService} from "../../ImageService";
import {report} from "../../log/Report";

export function loadMeme(meme:MemeDBEntry):Promise<Meme>{
    return new Promise<Meme>((resolve, reject) => {
        let memeIPFSLink = ipfsFileUploadService.convertIPFSLinkToHttpsLink(meme.memeIpfsHash);
        let promiseArray:Promise<boolean>[] = [];

        //(1) retreive IPFS meme and load its image data
        let ipfsMeme:IPFSMeme;
        let imgUrl;
        promiseArray.push(new Promise<boolean>((resolve2) => {
            axios.get(memeIPFSLink, {responseType: 'arraybuffer'}).then((response) => {
                ipfsMeme = JSON.parse(new Buffer(response.data, 'binary').toString());
                imageService.preLoadImage(ipfsFileUploadService.convertIPFSLinkToHttpsLink(ipfsMeme.imageIPFSHash)).then((imgUrlValue:string) => {
                    imgUrl = imgUrlValue;
                    resolve2(true);
                });
            });
        }));

        //(2) compute if current user voted
        let currentUserVoted;
        promiseArray.push(new Promise<boolean>((resolve2) => {
            authService.getLoggedUser().then(currentUserData => {
                upvoteService.hasVotedOnPost(meme.memeIpfsHash, currentUserData.uid).then(currentUserVotedValue => {
                    currentUserVoted=currentUserVotedValue;
                    resolve2(true);
                });
            });
        }));

        //(2.5) compute if current user bet
        //(6) is meme bettable
        let bettable = false;
        let currentUserBet;
        promiseArray.push(new Promise<boolean>((resolve2) => {
            authService.getLoggedUser().then(currentUserData => {
                firebaseBetService.isBetEnableOnPost(meme.memeIpfsHash).then(bettableRes => {
                    firebaseBetService.hasBetOnPost(meme.memeIpfsHash, currentUserData.uid).then(currentUserBetValue => {
                        currentUserBet=currentUserBetValue;
                        bettable = currentUserData.wallet >= 1.0 && bettableRes;
                        resolve2(true);
                    });
                });
            });
        }));

        //(3) compute number of vote
        let voteNumber;
        promiseArray.push(new Promise<boolean>((resolve2) => {
            upvoteService.countVote(meme.memeIpfsHash).then(voteNumberValue => {
                voteNumber=voteNumberValue;
                resolve2(true);
            });
        }));

        //(4) retreive author data
        let userValue;
        promiseArray.push(new Promise<boolean>((resolve2) => {
            userService.loadUserData(meme.uid).then((userValueValue: UserEntry) => {
                userValue=userValueValue;
                resolve2(true);
            });
        }));


        //(7) compute comment number
        let commentNumber=0;
        promiseArray.push(new Promise<boolean>((resolve2) => {
            firebaseCommentService.getCommentNumber(meme.memeIpfsHash).then( (nb:number) =>{
                commentNumber=nb;
                resolve2(true);
            });
        }));

        //(8) check if meme has been flagged localy
        let flag = false;
        promiseArray.push(new Promise<boolean>((resolve2) => {
            let hash = meme.memeIpfsHash;
            let localReportContent:boolean = !!report.getReportedContent("meme")[hash]
            let localReportUser:boolean = !!report.getReportedContent("user")[meme.uid];
            let distantReportContent = meme.flag;
            //TODO distant reported user
            flag = localReportContent || distantReportContent || localReportUser;
            resolve2(true);
        }));

        //resolve the meme
        Promise.all(promiseArray).then(value => {
            resolve({
                id: meme.memeIpfsHash,
                title: ipfsMeme.title,
                imageUrl: imgUrl,
                created: new Date(meme.created),
                user: userValue,
                dolarValue: meme.value?meme.value:0,
                commentNumber: commentNumber,
                voteNumber: voteNumber,
                currentUserVoted: currentUserVoted,
                currentUserBet:currentUserBet,
                hot:meme.hot!=0,
                hotDate:new Date(meme.hot),
                bettable:bettable,
                flag:flag,
            });
        })
    });
}