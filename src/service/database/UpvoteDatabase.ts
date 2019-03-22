import * as firebase from "firebase";
import {DATABASE_UPVOTES} from "../database/shared/DBDefinition";
import {audit} from "../log/Audit";

export class UpvoteDatabase {
    dataBase = DATABASE_UPVOTES

    hasVotedOnPost(memeId: string, uid: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            firebase.database().ref(this.dataBase + "/" + memeId).once("value", (data) => {
                let value: any[] = data.val();
                let userHasVoted = false;
                if(value!=null) {
                    Object.keys(value).forEach(userid => {
                        if (uid === userid) {
                            userHasVoted = true;
                        }
                    });
                }
                resolve(userHasVoted);
            });
        });
    }

    countVote(memeId: string): Promise<number> {
        return new Promise<number>(resolve => {
            firebase.database().ref(this.dataBase + "/" + memeId).once("value", (data) => {
                let value: any[] = data.val();
                if(value==null){
                    resolve(0);
                }else{
                    resolve(Object.keys(value).length);
                }
            }).catch(reason => {
                audit.reportError(reason);
                resolve(0);
            });
        });
    }

}

export let upvoteDatabase = new UpvoteDatabase();
