import axios from 'axios'
import {audit} from "../log/Audit";
import {GLOBAL_PROPERTIES} from "../../properties/properties";
import {upvoteDatabase} from "../database/UpvoteDatabase";

export class UpvoteService {

    hasVotedOnPost(memeId: string, uid: string): Promise<boolean> {
        return upvoteDatabase.hasVotedOnPost(memeId,uid);
    }

    countVote(memeId: string): Promise<number> {
        return upvoteDatabase.countVote(memeId);
    }

    vote(memeId: string, uid: string): Promise<string> {
        return new Promise<string>((resolve,reject) => {
            /*firebase.database().ref(this.dataBase + '/' + memeId+"/"+uid).set(new Date().getTime()).then(() => {
                resolve("ok");
            });*/
            axios.get(GLOBAL_PROPERTIES.VOTE_SERVICE_UPVOTE()+"/"+uid+"/"+memeId).then(response => {
                resolve("ok");
            }).catch(error => {
                audit.reportError("fail to upvote",error);
                reject("fail to upvote");
            });
        });
    }

}

export let upvoteService = new UpvoteService();
