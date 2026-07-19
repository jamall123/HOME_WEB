/**
 * firebase-config.js
 * إعدادات Firebase للموقع - يتم قراءتها من متغيرات البيئة عبر Vite
 */

window.FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Functions Region (عادة us-central1)
window.FUNCTIONS_REGION = import.meta.env.VITE_FUNCTIONS_REGION || "us-central1";

// API Base URL (يُملأ تلقائياً من Firebase Hosting)
window.API_BASE = import.meta.env.VITE_API_BASE || "";

// Initialize Firebase if not already initialized
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(window.FIREBASE_CONFIG);
}