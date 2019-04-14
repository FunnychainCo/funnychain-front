import {audit} from "../log/Audit";
import axios from "axios";
import {GLOBAL_PROPERTIES} from "../../properties/properties";

export class UpvoteDatabase {

    hasVotedOnPost(memeId: string, uid: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            if(uid==="" || !uid || memeId==="" ||!memeId){
                resolve(false);
            }else {
                axios.get(GLOBAL_PROPERTIES.REWARD_SERVICE_HAS_VOTE_ON_POST() + uid + "/" + memeId).then(response => {
                    resolve(response.data);
                }).catch(error => {
                    audit.reportError(error);
                });
            }
        });
    }

    countVote(memeId: string): Promise<number> {
        return new Promise<number>(resolve => {
            if(memeId==="" ||!memeId){
                resolve(0);
            }else {
                axios.get(GLOBAL_PROPERTIES.REWARD_SERVICE_COUNT_VOTE() + memeId).then(response => {
                    resolve(response.data);
                }).catch(error => {
                    audit.reportError(error);
                });
            }
        });
    }

}

export let upvoteDatabase = new UpvoteDatabase();
