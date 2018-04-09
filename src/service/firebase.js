import firebase from 'firebase'

var config = {
    apiKey: "AIzaSyClb51m-dOtbsZ4xlzQrGu6xMhLlfxilCg",
    authDomain: "funnychain-b2243.firebaseapp.com",
    databaseURL: "https://funnychain-b2243.firebaseio.com",
    projectId: "funnychain-b2243",
    storageBucket: "funnychain-b2243.appspot.com",
    messagingSenderId: "428682484079"
};

firebase.initializeApp(config)

export const ref = firebase.database().ref()
export const firebaseAuth = firebase.auth