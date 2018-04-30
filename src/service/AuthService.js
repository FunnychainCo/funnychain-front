import React from "react";
import {Route, Redirect} from 'react-router-dom'
import {firebaseAuthService} from "./FirebaseAuthService";

export class AuthService{
    auth (email, pw) {
        return firebaseAuthService.firebaseAuth().createUserWithEmailAndPassword(email, pw)
            .then(this.saveUser)
    }

    logout () {
        return firebaseAuthService.firebaseAuth().signOut()
    }

    login (email, pw) {
        return firebaseAuthService.firebaseAuth().signInWithEmailAndPassword(email, pw)
    }

    resetPassword (email) {
        return firebaseAuthService.firebaseAuth().sendPasswordResetEmail(email)
    }

    saveUser (user) {
        return firebaseAuthService.ref.child(`users/${user.uid}/info`)
            .set({
                email: user.email,
                uid: user.uid
            })
            .then(() => user)
    }

}

export var authService = new AuthService();

//TODO refactore this as a Private Route component
export function PrivateRoute ({component: Component, authed, ...rest}) {
    return (
        <Route
            {...rest}
            render={(props) => authed === true
                ? <Component {...props} />
                : <Redirect to={{pathname: '/login', state: {from: props.location}}} />}
        />
    )
}

export function PublicRoute ({component: Component, authed, ...rest}) {
    return (
        <Route
            {...rest}
            render={(props) => <Component {...props} />}
        />
    )
}
