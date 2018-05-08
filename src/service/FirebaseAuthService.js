import firebase from 'firebase'

export class FirebaseAuthService {
    config = {
        apiKey: "AIzaSyClb51m-dOtbsZ4xlzQrGu6xMhLlfxilCg",
        authDomain: "funnychain-b2243.firebaseapp.com",
        databaseURL: "https://funnychain-b2243.firebaseio.com",
        projectId: "funnychain-b2243",
        storageBucket: "funnychain-b2243.appspot.com",
        messagingSenderId: "428682484079"
    };

    ref = null;
    firebaseAuth = null;

    constructor() {
        firebase.initializeApp(this.config);
        this.ref = firebase.database().ref();
        this.firebaseAuth = firebase.auth;
    }
}

export var firebaseAuthService = new FirebaseAuthService();

export function getFirebaseAuthService() {
    return firebaseAuthService;
}
