/**
 * firebase-config.js
 * إعدادات Firebase للموقع - يتم قراءتها من متغيرات البيئة عبر Vite
 */

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCJ8I06UGVBOJdnU4Upp_EekS7txwX-fBg",
  authDomain: "jhomeweb-9ee56.firebaseapp.com",
  projectId: "jhomeweb-9ee56",
  storageBucket: "jhomeweb-9ee56.firebasestorage.app",
  messagingSenderId: "572713499787",
  appId: "1:572713499787:web:0cda5edea203991139288e",
  measurementId: "G-ZFPKRZBMFJ"
};

// Functions Region (عادة us-central1)
window.FUNCTIONS_REGION = "us-central1";

// API Base URL (يُملأ تلقائياً من Firebase Hosting)
window.API_BASE = "";

// Initialize Firebase if not already initialized
if (typeof firebase !== 'undefined' && !window.firebase.apps.length) {
    window.firebase.initializeApp(window.FIREBASE_CONFIG);
    
    // Connect to emulators if running locally
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Connecting to Firebase Emulators...');
        window.firebase.auth().useEmulator('http://127.0.0.1:9099');
        window.firebase.firestore().useEmulator('127.0.0.1', 8080);
        window.firebase.storage().useEmulator('127.0.0.1', 9199);
        window.firebase.functions().useEmulator('127.0.0.1', 5001);
    }
}