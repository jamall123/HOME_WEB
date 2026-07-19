/**
 * FirebaseAdapter.js
 * Centralizes Firebase App initializations and provides standard exports.
 * Removes global variable dependencies (`window.jhomeDb`).
 */

// Rely on the globally loaded Firebase Compat scripts (since we don't have Webpack yet)
// In the future, this would use: import { initializeApp } from "firebase/app";

const mainConfig = {
    apiKey: "AIzaSyCJ8I06UGVBOJdnU4Upp_EekS7txwX-fBg",
    authDomain: "jhomeweb-9ee56.firebaseapp.com",
    projectId: "jhomeweb-9ee56",
    storageBucket: "jhomeweb-9ee56.firebasestorage.app",
    messagingSenderId: "572713499787",
    appId: "1:572713499787:web:0cda5edea203991139288e",
    measurementId: "G-ZFPKRZBMFJ"
};

// Jhome App specific config
const jhomeConfig = {
    apiKey: "AIzaSyChw7pT22sB3jB_l0pT1yH_67eU6kOQ2qA", // Dummy, needs actual key
    authDomain: "jhome-academy.firebaseapp.com",
    projectId: "jhome-academy",
    storageBucket: "jhome-academy.appspot.com"
};

let mainApp;
let jhomeApp;

// Ensure main app is initialized
if (!firebase.apps.length) {
    mainApp = firebase.initializeApp(mainConfig);
} else {
    mainApp = firebase.app();
}

// Initialize Jhome specific secondary app if needed
const existingJhome = firebase.apps.find(app => app.name === 'jhome');
if (!existingJhome) {
    try {
        jhomeApp = firebase.initializeApp(mainConfig, 'jhome'); // Assuming same config but different instance for now, update keys later if truly multi-tenant
    } catch (e) {
        console.error("Failed to initialize jhome app instance:", e);
    }
} else {
    jhomeApp = existingJhome;
}

// Export database references
export const db = firebase.firestore(mainApp);
export const jhomeDb = firebase.firestore(jhomeApp || mainApp); // Fallback to main if secondary fails

export const auth = firebase.auth(mainApp);
export const jhomeAuth = firebase.auth(jhomeApp || mainApp);

export const storage = firebase.storage(mainApp);
export const functions = mainApp.functions('us-central1');

export const FirebaseAdapter = {
    db,
    jhomeDb,
    auth,
    jhomeAuth,
    storage,
    functions
};
