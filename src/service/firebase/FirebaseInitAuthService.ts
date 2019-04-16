import * as firebase from 'firebase'
import {GLOBAL_PROPERTIES} from "../../properties/properties";
import {lolTokenService} from "../generic/LolTokenService";
import {CACHE_DATABASE_META} from "../database/shared/DBDefinition";

export class FirebaseInitAuthService {
    constructor()
    {
    }
    start(){
        let config = {
            apiKey: GLOBAL_PROPERTIES.apiKey(),
            authDomain: GLOBAL_PROPERTIES.authDomain(),
            databaseURL: GLOBAL_PROPERTIES.databaseURL(),
            projectId: GLOBAL_PROPERTIES.projectId(),
            storageBucket: GLOBAL_PROPERTIES.storageBucket(),
            messagingSenderId: GLOBAL_PROPERTIES.messagingSenderId()
        };
        if (!firebase.apps.length) {
            firebase.initializeApp(config);
        }else{
            firebase.app().delete().then(()=> {
                firebase.initializeApp(config);
            });
        }
        this.fetchRate();
    }

    fetchRate(){
        lolTokenService.setRate(0.01);
        firebase.database().ref(CACHE_DATABASE_META + "/" + "rate").on("value", (data) => {
            if(data) {
                let value = data.val();
                if(value) {
                    lolTokenService.setRate(+value);
                }
            }
        });
    }
}

export let firebaseInitAuthService = new FirebaseInitAuthService();

