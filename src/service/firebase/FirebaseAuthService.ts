import * as firebase from 'firebase'
import {backEndPropetiesProvider} from "../BackEndPropetiesProvider";

export class FirebaseAuthService {
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

export var firebaseAuthService = new FirebaseAuthService();

export function getFirebaseAuthService() {
    return firebaseAuthService;
}
