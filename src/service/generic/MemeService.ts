import {fireBaseMemeService} from "../firebase/FireBaseMemeService";
import {firebaseMediaService} from "../firebase/FirebaseMediaService";
import {authService, UserEntry} from "./AuthService";
import * as Q from "q";

export interface Meme{
    id:string,
    uid:string,
    title:string,
    user:UserEntry,
    imageUrl:string,
    created:Date
}

export interface MemeServiceInterface {
    on(callback:(memes:Meme[]) => void):()=>void
}

export class MemeService implements MemeServiceInterface{

    on(callback:(memes:Meme[]) => void):()=>void {
        return fireBaseMemeService.on(memes => {
            let memesPromise:Promise<Meme>[] = [];
            Object.keys(memes).forEach(key => {
                memesPromise.push(new Promise<Meme>((resolve, reject) => {
                    let meme = memes[key];
                    firebaseMediaService.loadMediaEntry(meme.iid).then(imageValue => {
                        if(!imageValue.url.startsWith("https://")){
                            //do not display insecure meme it breaks the https of app
                            console.error(imageValue.url);
                            return;//just ignore the meme
                        }
                        authService.loadUserData(meme.uid).then((userValue:UserEntry) => {
                            resolve({
                                id:key,
                                uid: meme.uid,
                                title : meme.title,
                                user:userValue,
                                imageUrl:imageValue.url,
                                created:new Date(meme.created)
                            });
                        });
                    });
                }));
            });
            Q.all(memesPromise).then(memes => {
                callback(memes);
            });
        });
    }
}

export let memeProvider = new MemeService();