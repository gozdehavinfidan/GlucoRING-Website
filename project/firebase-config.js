// Loaded as a plain <script> (NOT type="text/babel") AFTER the Firebase
// compat SDK CDN tags and AFTER an untracked firebase-config.local.js file.
// Exposes window.fbAuth, window.fbDb, and window.firebaseFieldValue for use
// by auth-helpers.jsx and JSX modules.

(function () {
  if (!window.firebase) {
    throw new Error('firebase-config.js: Firebase compat SDK must be loaded via <script> tags first.');
  }

  var firebaseConfig = window.GLUCORING_FIREBASE_CONFIG;
  if (!firebaseConfig || !firebaseConfig.apiKey) {
    throw new Error('firebase-config.js: Missing Firebase config. Create project/firebase-config.local.js from firebase-config.local.example.js and keep it out of git.');
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  window.fbAuth = firebase.auth();
  window.fbDb = firebase.firestore();
  window.firebaseFieldValue = firebase.firestore.FieldValue;
})();
