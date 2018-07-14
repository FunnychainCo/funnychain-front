import * as firebase from 'firebase'
import {backEndPropetiesProvider} from "../BackEndPropetiesProvider";

export class FirebaseInitAuthService {

    public ref: firebase.database.Reference;
    public firebaseAuth: ((app?: firebase.app.App) => firebase.auth.Auth);

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
        this.ref = firebase.database().ref();
        this.firebaseAuth = firebase.auth;
    }
}

export let firebaseInitAuthService = new FirebaseInitAuthService();

