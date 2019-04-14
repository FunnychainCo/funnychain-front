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
        let listener = (message) => {
            callback(message);
        };
        realTimeData.getApp().service("/service/socket/comments").on('created', listener);

        //return remove listener function
        return () => {
            realTimeData.getApp().service("/service/socket/comments").off('created', listener);
        };
    }

}

export let commentDatabase = new CommentDatabase();
