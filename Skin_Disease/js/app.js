// app.js
import { signUp, signIn } from './auth';

// Handle sign up form submission
document.getElementById('sign-up-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signUp(email, password)
        .then((userCredential) => {
            console.log('User signed up:', userCredential.user);
        })
        .catch((error) => {
            console.error('Error signing up:', error.message);
        });
});

// Handle sign in form submission
document.getElementById('sign-in-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signIn(email, password)
        .then((userCredential) => {
            console.log('User signed in:', userCredential.user);
        })
        .catch((error) => {
            console.error('Error signing in:', error.message);
        });
});
