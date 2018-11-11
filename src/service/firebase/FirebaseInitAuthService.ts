import * as firebase from 'firebase'
import {backEndPropetiesProvider} from "../BackEndPropetiesProvider";

export class FirebaseInitAuthService {
    constructor() {
        let config = {
            apiKey: backEndPropetiesProvider.getProperty('apiKey'),
            authDomain: backEndPropetiesProvider.getProperty('authDomain'),
            databaseURL: backEndPropetiesProvider.getProperty('databaseURL'),
            projectId: backEndPropetiesProvider.getProperty('projectId'),
            storageBucket: backEndPropetiesProvider.getProperty('storageBucket'),
            messagingSenderId: backEndPropetiesProvider.getProperty('messagingSenderId')
        };
        firebase.initializeApp(config);
    }
}

export let firebaseInitAuthService = new FirebaseInitAuthService();

