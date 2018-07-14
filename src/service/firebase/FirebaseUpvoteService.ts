import * as firebase from "firebase";

export class FirebaseUpvoteService {
    dataBase = "upvotes"

    hasVotedOnPost(url: string, uid: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            firebase.database().ref(this.dataBase + "/" + this.makeDataBaseIdFromUrl(url)).once("value", (data) => {
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

    countVote(url: string): Promise<number> {
        return new Promise<number>(resolve => {
            firebase.database().ref(this.dataBase + "/" + this.makeDataBaseIdFromUrl(url)).once("value", (data) => {
                let value: any[] = data.val();
                if(value==null){
                    resolve(0);
                }else{
                    resolve(Object.keys(value).length);
                }
            }).catch(reason => {
                console.error(reason);
                resolve(0);
            });
        });
    }

     static simpleHash(s:string):string {
        /* Simple hash function. */
        let a = 1, c = 0, h, o;
        if (s) {
            a = 0;
            /*jshint plusplus:false bitwise:false*/
            for (h = s.length - 1; h >= 0; h--) {
                o = s.charCodeAt(h);
                a = (a<<6&268435455) + o + (o<<14);
                c = a & 266338304;
                a = c!==0?a^c>>21:a;
            }
        }
        return String(a);
    }

    makeDataBaseIdFromUrl(url: string): string {
        return FirebaseUpvoteService.simpleHash(url);
    }

    vote(url: string, uid: string): Promise<string> {
        return new Promise<string>(resolve => {
            firebase.database().ref(this.dataBase + '/' + this.makeDataBaseIdFromUrl(url)+"/"+uid).set(true).then(() => {
                resolve("ok");
            });
        });
    }

}

export let firebaseUpvoteService = new FirebaseUpvoteService();
