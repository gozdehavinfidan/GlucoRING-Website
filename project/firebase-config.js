// Loaded as a plain <script> AFTER the Firebase compat SDK CDN tags. If a
// local firebase-config.local.js was loaded earlier it sets
// window.GLUCORING_FIREBASE_CONFIG and overrides the public fallback below.
// Exposes window.fbAuth, window.fbDb, window.firebaseFieldValue.
//
// The Firebase Web API key is intentionally public — it identifies the
// project, it does not gate access. Security is enforced by Firebase Auth
// + Firestore Security Rules. See
// https://firebase.google.com/docs/projects/api-keys

(function () {
  if (!window.firebase) {
    throw new Error('firebase-config.js: Firebase compat SDK must be loaded via <script> tags first.');
  }

  var firebaseConfig = window.GLUCORING_FIREBASE_CONFIG || {
    apiKey: "AIzaSyAZNoOT6UNJ4rUvbV8pHAmaDUeJcZ1FURo",
    authDomain: "diasage.firebaseapp.com",
    projectId: "diasage",
    storageBucket: "diasage.firebasestorage.app",
    messagingSenderId: "552464313516",
    appId: "1:552464313516:web:202edb3eb74a3af8330309",
    measurementId: "G-9GKLL45G5E"
  };

  if (!firebaseConfig || !firebaseConfig.apiKey) {
    console.warn('firebase-config.js: Missing Firebase config.');
    window.fbAuth = null;
    window.fbDb = null;
    window.firebaseFieldValue = null;
    window.__firebaseUnavailable = true;
    return;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  window.fbAuth = firebase.auth();
  window.fbDb = firebase.firestore();
  window.firebaseFieldValue = firebase.firestore.FieldValue;
})();
