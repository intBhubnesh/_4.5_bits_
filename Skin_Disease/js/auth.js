// auth.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase-config';

// Function to sign up a user
export function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}

// Function to sign in a user
export function signIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}
