// Firebase Web Client Configuration — shared with DiaSAGE_website.
// Web API key is public by design (project identifier, not a secret).
// Security is enforced server-side via Firestore Rules + Auth + App Check.
// Reference: https://firebase.google.com/docs/projects/api-keys
//
// Loaded as a plain <script> (NOT type="text/babel") AFTER the Firebase
// compat SDK CDN tags. Exposes window.fbAuth, window.fbDb, and
// window.firebaseFieldValue for use by auth-helpers.jsx and JSX modules.

(function () {
  if (!window.firebase) {
    throw new Error('firebase-config.js: Firebase compat SDK must be loaded via <script> tags first.');
  }

  var firebaseConfig = {
    apiKey: "YOUR_FIREBASE_WEB_API_KEY",
    authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
    projectId: "diasage",
    storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID",
    measurementId: "YOUR_FIREBASE_MEASUREMENT_ID"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  window.fbAuth = firebase.auth();
  window.fbDb = firebase.firestore();
  window.firebaseFieldValue = firebase.firestore.FieldValue;
})();
