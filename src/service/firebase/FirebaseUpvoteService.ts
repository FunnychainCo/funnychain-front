import * as firebase from "firebase";
import {DATABASE_UPVOTES} from "./shared/FireBaseDBDefinition";
import axios from 'axios'
import {audit} from "../Audit";
import {GLOBAL_PROPERTIES} from "../../properties/properties";

export class FirebaseUpvoteService {
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

export let firebaseUpvoteService = new FirebaseUpvoteService();
