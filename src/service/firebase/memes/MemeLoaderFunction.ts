import {UserEntry} from "../../generic/UserEntry";
import {IPFSMeme, Meme} from "../../generic/Meme";
import axios from 'axios'
import {ipfsFileUploadService} from "../../IPFSFileUploader/IPFSFileUploadService";
import {userService} from "../../generic/UserService";
import {preLoadImage} from "../../ImageUtil";
import {firebaseCommentService} from "../FirebaseCommentService";
import {firebaseUpvoteService} from "../FirebaseUpvoteService";
import {authService} from 'src/service/generic/AuthService';
import {FirebaseMeme} from "../shared/FireBaseDBDefinition";
import {firebaseBetService} from "../FirebaseBetService";

export function loadMeme(meme:FirebaseMeme):Promise<Meme>{
    return new Promise<Meme>((resolve, reject) => {
        let memeIPFSLink = ipfsFileUploadService.convertIPFSLinkToHttpsLink(meme.memeIpfsHash);
        let promiseArray:Promise<boolean>[] = [];

        //(1) retreive IPFS meme and load its image data
        let ipfsMeme:IPFSMeme;
        let imgUrl;
        promiseArray.push(new Promise<boolean>((resolve2) => {
            axios.get(memeIPFSLink, {responseType: 'arraybuffer'}).then((response) => {
                ipfsMeme = JSON.parse(new Buffer(response.data, 'binary').toString());
                preLoadImage(ipfsFileUploadService.convertIPFSLinkToHttpsLink(ipfsMeme.imageIPFSHash)).then((imgUrlValue:string) => {
                    imgUrl = imgUrlValue;
                    resolve2(true);
                });
            });
        }));

        //(2) compute if current user voted
        let currentUserVoted;
        promiseArray.push(new Promise<boolean>((resolve2) => {
            authService.getLoggedUser().then(currentUserData => {
                firebaseUpvoteService.hasVotedOnPost(meme.memeIpfsHash, currentUserData.uid).then(currentUserVotedValue => {
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
            firebaseUpvoteService.countVote(meme.memeIpfsHash).then(voteNumberValue => {
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
                bettable:bettable
            });
        })
    });
}