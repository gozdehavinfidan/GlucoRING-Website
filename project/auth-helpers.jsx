// Authentication + Firestore helpers + useFirebaseAuth hook.
// Loaded as <script type="text/babel"> AFTER firebase-config.js. Exposes
// imperative helpers and a React hook on window so JSX modules can call
// them without an import system (no build step in this codebase).
//
// Mirrors DiaSAGE's src/features/auth/auth.js + the doctor-doc upsert
// pattern from src/features/dashboard/qr-link.js:97-104.

(function () {
  const firebaseUnavailable = () => (
    !window.fbAuth || !window.fbDb || window.__firebaseUnavailable
  );

  const missingFirebaseError = () => {
    const err = new Error('Firebase config missing');
    err.code = 'app/firebase-config-missing';
    return err;
  };

  // --- Imperative helpers ----------------------------------------------------

  // Sign in. `remember=true` → LOCAL persistence (survives tab close);
  // `remember=false` → SESSION persistence (cleared on tab close).
  // Persistence MUST be set before signInWithEmailAndPassword.
  window.signIn = async function (email, password, remember) {
    if (firebaseUnavailable()) throw missingFirebaseError();
    const persistence = remember
      ? firebase.auth.Auth.Persistence.LOCAL
      : firebase.auth.Auth.Persistence.SESSION;
    await window.fbAuth.setPersistence(persistence);
    return window.fbAuth.signInWithEmailAndPassword(email, password);
  };

  // Register a new doctor. Creates the Auth user, sets displayName, then
  // upserts /doctors/{uid} with the same shape DiaSAGE uses.
  window.signUp = async function (email, password, displayName) {
    if (firebaseUnavailable()) throw missingFirebaseError();
    const cred = await window.fbAuth.createUserWithEmailAndPassword(email, password);
    if (displayName) {
      await cred.user.updateProfile({ displayName });
    }
    await window.fbDb.collection('doctors').doc(cred.user.uid).set({
      email,
      displayName: displayName || '',
      createdAt: window.firebaseFieldValue.serverTimestamp(),
    });
    return cred;
  };

  window.signOutUser = function () {
    if (firebaseUnavailable()) return Promise.resolve();
    return window.fbAuth.signOut();
  };

  window.resetPassword = function (email) {
    if (firebaseUnavailable()) throw missingFirebaseError();
    return window.fbAuth.sendPasswordResetEmail(email);
  };

  // Turkish error messages — codes lifted from DiaSAGE qr-link.js:114-118
  // plus the rest of the common Firebase Auth error surface.
  window.mapAuthError = function (code) {
    switch (code) {
      case 'auth/invalid-email':
        return 'Geçersiz e-posta adresi.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Geçersiz e-posta veya şifre.';
      case 'auth/email-already-in-use':
        return 'Bu e-posta zaten kayıtlı.';
      case 'auth/weak-password':
        return 'Şifre en az 6 karakter olmalı.';
      case 'auth/too-many-requests':
        return 'Çok fazla deneme. Bir süre sonra tekrar deneyin.';
      case 'auth/network-request-failed':
        return 'Ağ hatası. Bağlantınızı kontrol edin.';
      case 'auth/missing-email':
        return 'E-posta gerekli.';
      case 'app/firebase-config-missing':
        return 'Firebase yapılandırması bu ortamda tanımlı değil.';
      default:
        return 'Bir hata oluştu. Tekrar deneyin.';
    }
  };

  // --- React hook ------------------------------------------------------------
  //
  // useFirebaseAuth() — subscribes to Firebase Auth state and fetches the
  // /doctors/{uid} profile doc once per sign-in. Returns:
  //   user    : firebase.User | null   (Firebase Auth handle)
  //   profile : doctors-doc data | null (displayName, email, …; null if no doc)
  //   ready   : boolean                 (true after the first auth snapshot)
  //
  // Defensive callers (per codebase convention, see app.jsx:14):
  //   const { user, profile, ready } = (typeof useFirebaseAuth === 'function')
  //     ? useFirebaseAuth()
  //     : { user: null, profile: null, ready: true };
  window.useFirebaseAuth = function useFirebaseAuth() {
    if (firebaseUnavailable()) {
      return { user: null, profile: null, ready: true };
    }
    const [user, setUser] = React.useState(() => window.fbAuth.currentUser);
    const [profile, setProfile] = React.useState(null);
    const [ready, setReady] = React.useState(false);

    React.useEffect(() => {
      const unsub = window.fbAuth.onAuthStateChanged(async (u) => {
        setUser(u);
        if (u) {
          try {
            const snap = await window.fbDb.collection('doctors').doc(u.uid).get();
            setProfile(snap.exists ? snap.data() : null);
          } catch (err) {
            console.error('[useFirebaseAuth] doctors fetch failed:', err);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        setReady(true);
      });
      return unsub;
    }, []);

    return { user, profile, ready };
  };
})();
