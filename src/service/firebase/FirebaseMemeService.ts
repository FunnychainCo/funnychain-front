import * as firebase from 'firebase';
import {idService} from "../IdService";
import {CommentsVisitor, Meme, MemeLoaderInterface, MemeServiceInterface} from "../generic/ApplicationInterface";
import {authService, UserEntry} from "../generic/AuthService";
import * as Q from 'q';
import {firebaseMediaService} from "./FirebaseMediaService";

export interface FirebaseMeme {
    title: string,
    iid: string,
    uid: string,
    created: string
}

interface FirebaseUser {
    uid: string
}

export class FirebaseMemeService implements MemeServiceInterface {
    dataBase = "memes"

    onFirebaseItemOnly(callback: (memes: { [id: string]: FirebaseMeme }) => void): () => void {
        let ref = firebase.database().ref(this.dataBase);
        let toremove = ref.on("value", (memes) => {
            if (memes == null) {
                console.error(memes);
                return;
            }
            let memesValue: { [id: string]: FirebaseMeme } = memes.val() || {};
            callback(memesValue);
        }, (errorObject) => {
            console.log("The read failed: " + errorObject.code);
        });
        //return remove listener function
        return () => {
            ref.off("value", toremove);
        };
    }

    on(callback: (memes: Meme[]) => void): () => void {
        return firebaseMemeService.onFirebaseItemOnly(memes => {
            let memesPromise: Promise<Meme>[] = [];
            Object.keys(memes).forEach(key => {
                memesPromise.push(new Promise<Meme>((resolve, reject) => {
                    let meme = memes[key];
                    firebaseMediaService.loadMediaEntry(meme.iid).then(imageValue => {
                        if (!imageValue.url.startsWith("https://")) {
                            //do not display insecure meme it breaks the https of app
                            console.error(imageValue.url);
                            return;//just ignore the meme
                        }
                        authService.loadUserData(meme.uid).then((userValue: UserEntry) => {
                            resolve({
                                id: key,
                                title: meme.title,
                                imageUrl: imageValue.url,
                                created: new Date(meme.created),
                                user: userValue,
                                dolarValue: 0,
                                commentNumber: 0,
                                voteNumber: 0,
                                currentUserVoted: false,
                                order:0
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

    createMeme(meme: FirebaseMeme) {
        let currentUser = firebase.auth().currentUser;
        if (currentUser == null) {
            console.error(currentUser);
            return;
        }
        let user: FirebaseUser = currentUser;
        meme.uid = user.uid;//ensure ownership of meme
        meme.created = new Date().toString();//ensure creation date of meme
        return new Promise((resolve) => {
            console.log(meme);
            firebase.database().ref(this.dataBase + '/' + idService.makeid()).set(meme);
        });
    }

    getCommentVisitor(id): CommentsVisitor {
        return {
            loadMore(limit) {
            },
            on(callback) {
                return () => {
                };
            },
            postComment(a, b) {
                return new Promise(resolve => resolve("ok"))
            }
        };
    }

    vote(url: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            resolve("ok")
        });
    }

    getMemeLoader(type: string, tags: string[]): MemeLoaderInterface {
        return new MemeLoader();
    }

    post(title: string, body: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            resolve("ok");
        });
    }

}

class MemeLoader implements MemeLoaderInterface{
    loadMore(limit: number) {
    }

    dataBase = "memes"

    onFirebaseItemOnly(callback: (memes: { [id: string]: FirebaseMeme }) => void): () => void {
        let ref = firebase.database().ref(this.dataBase);
        let toremove = ref.on("value", (memes) => {
            if (memes == null) {
                console.error(memes);
                return;
            }
            let memesValue: { [id: string]: FirebaseMeme } = memes.val() || {};
            callback(memesValue);
        }, (errorObject) => {
            console.log("The read failed: " + errorObject.code);
        });
        //return remove listener function
        return () => {
            ref.off("value", toremove);
        };
    }

    on(callback: (memes: Meme[]) => void): () => void {
        return firebaseMemeService.onFirebaseItemOnly(memes => {
            let memesPromise: Promise<Meme>[] = [];
            Object.keys(memes).forEach(key => {
                memesPromise.push(new Promise<Meme>((resolve, reject) => {
                    let meme = memes[key];
                    firebaseMediaService.loadMediaEntry(meme.iid).then(imageValue => {
                        if (!imageValue.url.startsWith("https://")) {
                            //do not display insecure meme it breaks the https of app
                            console.error(imageValue.url);
                            return;//just ignore the meme
                        }
                        authService.loadUserData(meme.uid).then((userValue: UserEntry) => {
                            resolve({
                                id: key,
                                title: meme.title,
                                imageUrl: imageValue.url,
                                created: new Date(meme.created),
                                user: userValue,
                                dolarValue: 0,
                                commentNumber: 0,
                                voteNumber: 0,
                                currentUserVoted: false,
                                order:0
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


    refresh() {
    }

}

export let firebaseMemeService = new FirebaseMemeService();
