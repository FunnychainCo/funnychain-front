import {CommentDBEntry} from "../database/shared/DBDefinition";
import {audit} from "../log/Audit";
import axios from "axios";
import {GLOBAL_PROPERTIES} from "../../properties/properties";
import {realTimeData} from "./RealTimeData";


export class CommentDatabase {

    getCommentNumber(memeId: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            axios.get(GLOBAL_PROPERTIES.COMMENTS_SERVICE() + "/numbers/" + memeId).then(response => {
                resolve(response.data);
            }).catch(error => {
                audit.reportError(error);
                reject(error);
            });
        });
    }

    on(memeId: string, callback: (comments: CommentDBEntry) => void): () => void {
        // Listen to real time event to notify

        axios.get(GLOBAL_PROPERTIES.COMMENTS_SERVICE() + "/comments/" + memeId).then(response => {
            let comments:{[id:string]:CommentDBEntry} = response.data;
            Object.keys(comments).forEach(key => {
                let comment = comments[key];
                callback(comment);
            })
        }).catch(error => {
            audit.reportError(error);
        });

        let remove = realTimeData.getResoureSubscriber().on("/service/comments/"+memeId,"created",(message) => {
            callback(message);
        });

        //return remove listener function
        return remove;
    }

}

export let commentDatabase = new CommentDatabase();
