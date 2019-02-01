import * as firebase from 'firebase'
import {GLOBAL_PROPERTIES} from "../../properties/properties";

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
        firebase.initializeApp(config);
    }
}

export let firebaseInitAuthService = new FirebaseInitAuthService();

