import firebase from 'firebase'
import {backEndPropetiesProvider} from "./BackEndPropetiesProvider";

export class FirebaseAuthService {
    ref = null;
    firebaseAuth = null;

    constructor() {
        var config = {};
        config.apiKey = backEndPropetiesProvider.getProperty('apiKey');
        config.authDomain = backEndPropetiesProvider.getProperty('authDomain');
        config.databaseURL = backEndPropetiesProvider.getProperty('databaseURL');
        config.projectId = backEndPropetiesProvider.getProperty('projectId');
        config.storageBucket = backEndPropetiesProvider.getProperty('storageBucket');
        config.messagingSenderId = backEndPropetiesProvider.getProperty('messagingSenderId');
        firebase.initializeApp(config);
        this.ref = firebase.database().ref();
        this.firebaseAuth = firebase.auth;
    }
}

export var firebaseAuthService = new FirebaseAuthService();

export function getFirebaseAuthService() {
    return firebaseAuthService;
}
