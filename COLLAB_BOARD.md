# COLLAB_BOARD

Minimal strict protocol for CODEX ↔ CLAUDE collaboration.

## Session

- Type: `FEATURE`
- Status: `ACTIVE`
- Reset: `2026-04-27`
- Topic: `GlucoRING websitesini DiaSAGE Firebase backend'ine bağlama`
- Goal: `Şu anda setTimeout ile mock olan doktor girişi (login.jsx:12) ve QR eşleştirme (qr.jsx:5-9) akışlarını DiaSAGE'in çalışan Firebase backend'ine (projectId: diasage) bağlamak. Aynı projeyi paylaşmak: aynı doctors/{uid}, linkSessions/{id}, patients/{uid}/healthMetrics koleksiyonları; aynı diaagent://link?sessionId=&token= deep-link şeması; aynı mobil companion app her iki siteyi de tanır.`
- Done: `(a) Geçerli doktor e-posta+şifre ile sign-in çalışır, sidebar'da gerçek displayName görünür; (b) Yanlış şifre Türkçe hata mesajı gösterir; (c) Sign-up yeni kullanıcı + doctors/{uid} doc'u oluşturur (Firestore Console'da doğrulanır); (d) QR sayfası gerçek linkSessions/{id} doc'u yazar, gerçek diaagent:// QR render eder, status='confirmed' olunca onSnapshot ile UI ilerler; (e) "Beni hatırla" Auth persistence (LOCAL/SESSION) doğru davranır; (f) Sign-out landing'e döner; (g) Şifremi unuttum gerçek e-posta gönderir.`
- Stall: CHECK=15m, HANDOFF=10m

## State

- CLAUDE: `START` - PRIMARY (CODEX review returned changes requested)
- CODEX: `ON_HOLD` - SECONDARY
- Valid: `START` · `WORKING` · `ON_HOLD` · `DONE`

## Turn Format

Each turn: heading `### TURN-{P|I}{n} ({ACTOR})` with required fields:

- **Header**: PART (PLAN|IMPL) · RESPONDS_TO (<turn>|NEW) · POINTS (<ids>|N/A)
- **Body**: FINDINGS · CHALLENGE · PROPOSAL — bullet list or N/A each
- **Evidence**: Disputed claims require ≥1: file:line, test output, doc ref, or step-by-step reasoning
- **Handoff**: Self WORKING→ON_HOLD, other ON_HOLD→START (only after content final)

## Point Tracker

| ID  | Part | Title                                                          | Status   | Resolved In |
|-----|------|----------------------------------------------------------------|----------|-------------|
| P1  | PLAN | Aynı `diasage` Firebase projesini paylaş (yeni proje değil)     | AGREED   | TURN-P1     |
| P2  | PLAN | `diaagent://link?...` deep-link şemasını paylaş                | AGREED   | TURN-P1     |
| P3  | PLAN | Firebase Compat SDK v10.12.0 (DiaSAGE ile sürüm eşitliği)      | AGREED   | TURN-P1     |
| P4  | PLAN | `firebase-config.js` (plain JS) + `auth-helpers.jsx` ekle      | AGREED   | TURN-P1     |
| P5  | PLAN | `useFirebaseAuth()` hook'u `window` üzerinde — context değil    | AGREED   | TURN-P1     |
| P6  | PLAN | login.jsx tam parite: signIn+signUp+forgot+remember+TR errors  | AGREED   | TURN-P1     |
| P7  | PLAN | qr.jsx tam yeniden yaz: gerçek linkSessions + qrcodejs + 30min | AGREED   | TURN-P1     |
| P8  | PLAN | shell.jsx user chip + sign-out; pages.jsx Settings'e Çıkış kart | AGREED   | TURN-P1     |
| P9  | PLAN | Both HTML files (GlucoRING.html + GlucoRING-standalone.html)   | AGREED   | TURN-P1     |
| P10 | PLAN | Dashboard/Patients/Reports Firestore wiring OUT_OF_SCOPE       | AGREED   | TURN-P1     |
| I1  | IMPL | Phase 1 — Foundation: CDN tags + firebase-config + auth-helpers | AGREED (CLAUDE)   | TURN-I1 |
| I2  | IMPL | Phase 2 — app.jsx auth gate (useFirebaseAuth wiring)           | AGREED (CLAUDE)   | TURN-I2 |
| I3  | IMPL | Phase 3 — login.jsx real auth + register + forgot + remember   | AGREED (CLAUDE)   | TURN-I2 |
| I4  | IMPL | Phase 4 — shell.jsx user chip + sign-out button                | AGREED (CLAUDE)   | TURN-I2 |
| I5  | IMPL | Phase 5 — qr.jsx full rewrite (Firestore + qrcodejs)           | AGREED (CLAUDE)   | TURN-I3 |
| I6  | IMPL | Phase 6 — pages.jsx Settings real profile + sign-out card      | AGREED (CLAUDE)   | TURN-I3 |
| I7  | IMPL | Phase 7 — Verification matrix (10 test cases — browser run)    | OPEN — needs USER | —       |
| I8  | IMPL | Primary `GlucoRING (Standalone).html` not wired to Firebase      | OPEN - CODEX      | -       |
| I9  | IMPL | QR listener ignores remote `expiresAt` changes                   | OPEN - CODEX      | -       |
| I10 | IMPL | Sign-in now bypasses QR pairing route                            | OPEN - DECIDE     | -       |
| I11 | IMPL | Auth `ready` waits on doctor-profile fetch                       | DEFERRED - RISK   | TURN-I4 |

Statuses: OPEN · AGREED · REJECTED · DEFERRED · OUT_OF_SCOPE. Prefixes: P* (plan), I* (impl).

## Rules

1. **Single State section** — hand-state lines appear only under `## State`.
2. **Session contract** — PRIMARY fills Session before PLAN; SECONDARY ACKs in first turn.
3. **Two phases** — PLAN → IMPLEMENTATION. IMPL starts only when no OPEN plan points + both `AGREE_FINAL_PLAN: YES`.
4. **State machine** — Receiver acts only on `START`. Enter: self→WORKING, other→ON_HOLD. Exit: self→ON_HOLD, other→START. No parallel turns.
5. **Stall recovery** — No update for CHECK → log `STALL_CHECK`. Still silent after HANDOFF → set stalled ON_HOLD, self→START.
6. **Deadlock** — Max 3 unresolved turns/point → PRIMARY decides: `DECISION: <id> → ACCEPT|REJECT|DEFER`.
7. **Impl authority** — Only PRIMARY edits project files (except this board). SECONDARY reviews. Each impl turn records `BRANCH`, `BASE_COMMIT`, `LATEST_COMMIT`.
8. **Terminal** — COMPLETED/ABORTED sets both hands DONE; no new turns after.

## PLAN

AGREE_FINAL_PLAN: YES (CLAUDE, TURN-P1) · YES (USER, plan-mode-approval 2026-04-27) · pending CODEX ACK

### TURN-P1 (CLAUDE)

- **Header**: PART PLAN · RESPONDS_TO NEW · POINTS P1,P2,P3,P4,P5,P6,P7,P8,P9,P10

- **FINDINGS**:
  - GlucoRING repo (`N:/gozde/free/smart-ring-website/project/`) Claude Design handoff bundle: React 18 UMD + Babel Standalone in-browser, build step yok, modül sistemi yok. Komponentler `window.X = X` global pattern'i ile expose ediliyor (örn. `login.jsx:69`, `qr.jsx:112`, `shell.jsx:70-71`, `pages.jsx:441-447`). Defansif "if available" pattern: `(typeof useTweaks === 'function') ? useTweaks() : ...` (`app.jsx:14, 73`).
  - **Mock #1 — Doktor girişi**: `login.jsx:9-13` `submit` fonksiyonu sadece `setTimeout(() => { setLoading(false); onLogin(); }, 700)` yapıyor. Hiçbir doğrulama yok, herhangi bir e-posta+şifre kombinasyonu route'u ilerletiyor. Form alanları: email, pw, remember. Hata slot'u yok. Register modu yok. "Şifremi unuttum" linki (`login.jsx:51`) wire değil.
  - **Mock #2 — QR pairing**: `qr.jsx:5-9` `setTimeout(setStep(1), 4500)` ve `setTimeout(setStep(2), 8200)` ile fake step machine. `qr.jsx:14-43` dekoratif SVG QR (rastgele cell pattern, gerçek encode değil). `qr.jsx:95` hardcoded `'SESSION · 4F-9B2C-7AE3'`.
  - **Mock #3 — Sidebar user chip**: `shell.jsx:36-43` "Dr. Kullanıcı" + "Endokrinoloji" sabit. Sign-out yok.
  - **Mock #4 — Settings profile**: `pages.jsx:416-418` `defaultValue="Dr. Kullanıcı"` vb. uncontrolled inputs, kaydetme yok, sign-out kartı yok.
  - **Route state machine** (`app.jsx:11-12`): `landing → login → qr → app`, auth-state'e duyarsız. `setRoute('qr')` `Login.onLogin` ile, `setRoute('app')` `QrPairing.onDone` ile tetikleniyor.
  - DiaSAGE backend kontratı (`N:/gozde/2242/smartwatch 3d models/WatchModel_260208/DiaSAGE_website/`):
    - Firebase Compat SDK v10.12.0 (`gstatic.com/firebasejs/10.12.0/firebase-{app,auth,firestore,analytics}-compat.js`).
    - Project: `diasage` (config: `src/config/firebase-config.js:6-14`, public-by-design Firebase API key).
    - Collections + tam alan listesi: `doctors/{uid}` → `{email,displayName,createdAt:serverTimestamp}` (`auth.js:28-32`); `linkSessions/{sessionId}` → `{doctorUid,doctorEmail,doctorName,status,token,createdAt:ms,expiresAt:ms,patientUid?}` (`qr-link.js:147-155`); `patients/{uid}/healthMetrics` (subcollection, time-series); `linkedDevices/{doctorUid}_{patientUid}`.
    - Deep-link: `diaagent://link?sessionId=…&token=…` (`qr-link.js:162`).
    - Lifecycle: doctor signs in → create linkSessions doc with status='pending', 30-min TTL → render QR → onSnapshot listener → patient app writes status='confirmed'+patientUid → web advances → openMonitor(patientUid).
    - **Firestore rules dosyası repo'da yok** (Console-managed). GlucoRING aynı projeyi paylaştığı için aynı rules'a tabi olacak.
  - GlucoRING'in `assets/` dizini 148 MB (ring frame'leri + screenshots) — git'e girdi ama push aşamasında LFS gerekecek (push şu turun kapsamında değil).

- **CHALLENGE**: N/A (CODEX bu turun ACK'i için bekleniyor; bu turun argümanlarına henüz karşı görüş yok).

- **PROPOSAL**:

  **P1 — Aynı `diasage` Firebase projesi**: GlucoRING'in `firebase-config.js`'i DiaSAGE'in `src/config/firebase-config.js:6-14` içeriğini birebir kopyalar. Ayrı `glucoring` projesi izolasyon sağlar ama mobil app'in deep-link/projectId yapılandırmasını da değiştirir, paylaşılan veri hedefini kırar. User goal: "DiaSAGE database'e bağla" → aynı proje.

  **P2 — `diaagent://` deep-link şeması**: Mobil app bu şemayı zaten register etmiş; `glucoring://`'e geçmek mobil release ister ve dolaşımdaki DiaSAGE QR'larını kırar. "GlucoRING" web-side bir branding katmanı; QR şeması paylaşımlı kalır.

  **P3 — Firebase Compat SDK v10.12.0**: DiaSAGE bu sürümü pin'liyor. Eşitleme version drift'i önler; CDN cache hits paylaşılır. Modül stili (`firebase-app-compat.js` global `firebase` objesi) GlucoRING'in no-build pragması ile birebir uyumlu.

  **P4 — Yeni dosyalar**:
    - `project/firebase-config.js` (plain JS, Babel değil) — `firebaseConfig` verbatim copy + `firebase.initializeApp(firebaseConfig)` + `window.fbAuth = firebase.auth()`, `window.fbDb = firebase.firestore()`, `window.firebaseFieldValue = firebase.firestore.FieldValue`.
    - `project/auth-helpers.jsx` (Babel) — `window.signIn(email,pw,remember)` (setPersistence LOCAL/SESSION önce, sonra signInWithEmailAndPassword), `window.signUp(email,pw,displayName)` (createUserWithEmailAndPassword → updateProfile → doctors/{uid}.set), `window.signOutUser()`, `window.resetPassword(email)`, `window.mapAuthError(code)` (TR mesajlar — DiaSAGE qr-link.js:114-118 referans), `window.useFirebaseAuth()` React hook (`useState + useEffect + onAuthStateChanged`, sign-in olunca `doctors/{uid}.get()` profile fetch).

  **P5 — `useFirebaseAuth()` hook on window**: Context+Provider'a alternatif. JSX no-module bağlamına uyar, prop-drilling önler. App ve Settings bağımsız çağırır. Defansif fallback: `(typeof useFirebaseAuth === 'function') ? useFirebaseAuth() : {user:null, profile:null, ready:true}` — `app.jsx:14`'teki `useTweaks` kalıbının aynısı.

  **P6 — login.jsx tam parite**: state ekle: `mode` ('signin'|'signup'), `displayName`, `error`. Submit: mode'a göre `signIn(email,pw,remember)` veya `signUp(email,pw,displayName)`; catch → `setError(mapAuthError(err.code))`. `onLogin` prop'u kullanma — auth state listener (App içinde) route'u sürer. Hata banner submit altında. `displayName` field sadece signup. "Şifremi unuttum" → `resetPassword(email)`. Toggle link: "Hesap oluştur" / "Giriş yap".

  **P7 — qr.jsx tam yeniden yaz**: Dekoratif `QrPattern` SVG kaldır. State: `session` ({sessionId,token,expiresAt}), `status` ('initializing'|'pending'|'confirmed'|'expired'|'error'), `remaining` (countdown). 4 useEffect: (1) mount/regenerate'da `linkSessions/{sid}.set()` DiaSAGE schema (qr-link.js:147-155 verbatim alan adları), (2) onSnapshot listener `status==='confirmed'`, (3) `new QRCode(qrRef.current, {text: 'diaagent://link?sessionId=…&token=…', width:256, correctLevel: QRCode.CorrectLevel.M})` div ref'e mount, (4) 1s interval countdown + auto-expire 30min. "Yeni Kod" version-counter bump. Step machine status'tan türetilir, setTimeout'tan değil.

  **P8 — shell.jsx + Settings sign-out**: `Sidebar` props: `userName`, `userEmail`, `onSignOut`. Avatar initials hesaplaması: `userName.split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase()`. `.sidebar-foot` içinde sign-out icon-button. `pages.jsx` Settings: `useFirebaseAuth()` çağır, profile field'ları controlled (state + onChange), "Kaydet" butonu `doctors/{uid}.update()`. 3. kart "Oturum" — destructive "Çıkış Yap" butonu.

  **P9 — Her iki HTML'e CDN tag insertion**: `GlucoRING.html:24-25` (Babel sonrası, ilk Babel JSX öncesi) ve `GlucoRING-standalone.html:69-71`'de aynı insertion noktasına şu sıra:
    ```html
    <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <script src="firebase-config.js"></script>
    <script type="text/babel" src="auth-helpers.jsx"></script>
    ```
  Sıra önemli: compat SDK + qrcodejs yüklenmeden config çalışamaz; config çalışmadan auth-helpers kullanamaz; auth-helpers diğer JSX'lerden önce parse edilmeli ki `useFirebaseAuth` global'ı hazır olsun.

  **P10 — OUT_OF_SCOPE**: Dashboard, Patients, PatientDetail, Alerts, Reports, NotesPage Firestore wiring bu turda dahil değil. `pages.jsx`'te bu sayfalar zaten boş placeholder ("—"); doktor sign in olur ve eşleşir, ama dashboard kartları statik kalır. Phase 2 işi.

- **VERIFICATION** (P6-paralel — IMPL turun'da uygulanacak matris): 10 test case `Done` kriterine eşle:
  1. Geçerli DiaSAGE doktor creds → `'app'` route'a gidiş, sidebar gerçek `displayName`.
  2. Yanlış şifre → TR hata banner, route değişmez.
  3. Yeni e-posta sign-up → Auth user yaratıldı + `doctors/{uid}` Firestore Console'da görünür (`email`, `displayName`, `createdAt` doğru).
  4. QR sayfasına git → `linkSessions/{sid}` Firestore Console'da `status:'pending'`, 32-hex token, `expiresAt` ~30 dk; QR DOM'da gerçek (telefon kamerası `diaagent://link?sessionId=…&token=…` decode eder).
  5. Manuel `status:'confirmed'` Console'dan → ~1s içinde UI step 2'ye geçer, "Panele Git" görünür.
  6. Manuel `expiresAt = Date.now()-1000` → UI expired state.
  7. "Beni hatırla" KAPALI sign-in + tab kapat/aç → landing'e düşer; AÇIK + reopen → direkt `'app'`.
  8. Settings → "Çıkış Yap" → landing; reopen otomatik sign-in olmaz.
  9. "Şifremi unuttum" + geçerli e-posta → gerçek reset e-postası gelir.
  10. Cross-app: aynı creds DiaSAGE site'ında çalışır (paylaşılan backend kanıtı).

- **PHASE ORDERING** (her phase site'ı çalışır bırakır):
  1. **I1 Foundation** — CDN tags + firebase-config.js + auth-helpers.jsx. JSX değişmez. Devtools'tan `window.fbAuth` callable.
  2. **I2 App auth gate** — `useFirebaseAuth` `app.jsx`'e. Console'dan manuel user → otomatik route'lama doğrulanır.
  3. **I3 Login** — Gerçek auth + register toggle + forgot + persistence + TR hata.
  4. **I4 Sidebar** — User chip + sign-out.
  5. **I5 QR** — Tam rewrite.
  6. **I6 Settings** — Controlled profile + sign-out card.
  7. **I7 Polish** — `onLogin` prop temizliği; her iki HTML doğrulaması; verification matrisi koşusu.

- **RISKS / KNOWN GAPS**:
  - Firestore rules dosyası repo'da yok (Console-managed). Aynı projeye yazıyoruz, mevcut rules doctor reads on own `doctors/{uid}`, create/read on `linkSessions/*` where `doctorUid==auth.uid`'a izin vermiyorsa Firestore writes sessizce başarısız olur (devtools console hatasında görünür).
  - `linkedDevices` doc creation mobile app'in işi (qr-link.js'te yazılmıyor); GlucoRING de yazmaz.
  - Babel-in-browser her sayfa yüklemesinde her JSX'i parse eder. Prototype için kabul, prod için precompile.
  - CDN integrity hash'leri pinned değil (DiaSAGE de pinlemiyor — convention; supply-chain notu).
  - 148 MB `assets/` git history'ye girdi; remote push aşamasında LFS gerekecek.

- **Evidence**:
  - `N:/gozde/free/smart-ring-website/project/login.jsx:9-13` — fake submit
  - `N:/gozde/free/smart-ring-website/project/qr.jsx:5-9, 14-43, 95` — fake step + decorative QR + hardcoded session text
  - `N:/gozde/free/smart-ring-website/project/shell.jsx:36-43` — hardcoded user chip
  - `N:/gozde/free/smart-ring-website/project/app.jsx:11-14, 60-64` — auth-blind route machine
  - `N:/gozde/free/smart-ring-website/project/pages.jsx:405-438` — Settings hardcoded
  - `N:/gozde/free/smart-ring-website/project/GlucoRING.html:22-34` — script tag list
  - `N:/gozde/2242/smartwatch 3d models/WatchModel_260208/DiaSAGE_website/src/config/firebase-config.js:6-14` — config to copy
  - `N:/gozde/2242/smartwatch 3d models/WatchModel_260208/DiaSAGE_website/src/features/auth/auth.js:24-43` — sign-in/up/out helper shapes
  - `N:/gozde/2242/smartwatch 3d models/WatchModel_260208/DiaSAGE_website/src/features/dashboard/qr-link.js:84-211` — full QR session lifecycle reference
  - `N:/gozde/2242/smartwatch 3d models/WatchModel_260208/DiaSAGE_website/src/features/dashboard/qr-link.js:114-118` — TR error message map
  - Plan file: `C:/Users/havin/.claude/plans/collab-board-kullanarak-diasage-website-smooth-token.md` (user approved)

- **AGREE_FINAL_PLAN**: YES (CLAUDE) — pending CODEX ACK.

- **Handoff**: CLAUDE WORKING→ON_HOLD, CODEX ON_HOLD→START.

## IMPLEMENTATION

AGREE_FINAL_IMPLEMENTATION: YES (CLAUDE, TURN-I3) · NO (CODEX, TURN-I4 - changes requested) — pending fixes/decision and USER browser-verification (I7).

### TURN-I1 (CLAUDE)

- **Header**: PART IMPL · RESPONDS_TO TURN-P1 · POINTS I1 · COVERS P3,P4,P9

- **Commit info**:
  - `BRANCH`: main
  - `BASE_COMMIT`: `9ea4525` (COLLAB_BOARD baseline)
  - `LATEST_COMMIT`: `bfbc576` ("feat(I1): foundation — Firebase compat SDK + auth helpers")
  - Files touched: `project/firebase-config.js` (new, +30), `project/auth-helpers.jsx` (new, +110), `project/GlucoRING.html` (+7), `project/GlucoRING-standalone.html` (+7)

- **FINDINGS**:
  - GlucoRING'in Babel-in-browser stack'i no-module/no-build pragması taşıyor (`<script type="text/babel">` JSX'i runtime'da derliyor). Bu, DiaSAGE'in `import {firebaseConfig} from './firebase-config.js'` ES-module pattern'ini birebir taşımayı engelliyor. Çözüm: `firebase-config.js`'i plain `<script>` (Babel **DEĞİL**) olarak yükle, `firebaseConfig`'i `window` üzerinden expose et. Bu DiaSAGE'in `firebase-init.js`'inin no-module versiyonu.
  - CDN insertion sırası kritik: `firebase-app/auth/firestore-compat.js` global `firebase`'i sağlıyor → `firebase-config.js` `firebase.initializeApp` çağırıp `window.fbAuth`/`window.fbDb`'yi kuruyor → `auth-helpers.jsx` (Babel) `useFirebaseAuth` hook'unu `window` üzerine yapıştırıyor → diğer JSX'ler bu globalleri kullanıyor. Hatalı sırada ReferenceError veya "Firebase not initialized" başarısızlıkları olur.
  - Hook iç tasarımı: `onAuthStateChanged` callback'i async — sign-in olunca `doctors/{uid}.get()` ile profil fetch ediyor. Profile `{user, profile, ready}` olarak döndürülüyor; `ready` ilk auth snapshot geldiğinde `true` oluyor (tıpkı DiaSAGE'in `qr-link.js:47-58` deki `qrAuthUnsubscribe` pattern'i gibi).

- **CHANGES**:
  - `project/firebase-config.js:1-31` — IIFE wrapper, `firebase.initializeApp(firebaseConfig)` (config DiaSAGE `src/config/firebase-config.js:6-14`'ten verbatim), `window.fbAuth`/`window.fbDb`/`window.firebaseFieldValue` exposure.
  - `project/auth-helpers.jsx:1-115` — `window.signIn` (`setPersistence` LOCAL/SESSION önce, sonra `signInWithEmailAndPassword`); `window.signUp` (`createUserWithEmailAndPassword` → `updateProfile` → `doctors/{uid}.set` with `serverTimestamp()`); `window.signOutUser`; `window.resetPassword`; `window.mapAuthError(code)` (TR mesajlar — DiaSAGE qr-link.js:114-118 kodları + ek edge case'ler); `window.useFirebaseAuth()` React hook.
  - `project/GlucoRING.html` ve `project/GlucoRING-standalone.html` — Babel script'inden sonra, ilk `text/babel` JSX'inden önce şu sıra: firebase-app-compat → firebase-auth-compat → firebase-firestore-compat → qrcodejs → firebase-config.js → auth-helpers.jsx.

- **CHALLENGE**: N/A — Phase 1 plan'a uygun uygulandı, deviation yok.

- **VERIFICATION** (Phase 1'in tek başına gözlemlenebilir doğrulaması):
  - Sayfa açılışında devtools console'da: `typeof window.fbAuth === 'object'` ve `'currentUser' in window.fbAuth` → true. Aynı şekilde `typeof window.useFirebaseAuth === 'function'` → true.
  - JSX bileşenleri henüz değişmediği için site'ın görsel davranışı **hiç değişmedi** — landing/login/qr/app rotaları yine setTimeout-driven mock akışla çalışıyor. Bu phase'in başarı kriteri budur (no regression + globals exposed).

- **Evidence**:
  - `project/firebase-config.js:11-19` — config copy
  - `project/auth-helpers.jsx:18-23` — `setPersistence` BEFORE `signInWithEmailAndPassword`
  - `project/auth-helpers.jsx:30-40` — `signUp` doctors/{uid} upsert with `serverTimestamp()`
  - `project/auth-helpers.jsx:74-103` — `useFirebaseAuth` hook (auth state + profile fetch)
  - `project/GlucoRING.html:24-31` — CDN insertion site

- **I1 durumu**: AGREED (self).

- **Handoff**: CLAUDE WORKING→ON_HOLD, CODEX ON_HOLD→START.

### TURN-I2 (CLAUDE)

- **Header**: PART IMPL · RESPONDS_TO TURN-P1 · POINTS I2,I3,I4 · COVERS P5,P6,P8

- **Commit info**:
  - `BRANCH`: main
  - `BASE_COMMIT`: `bfbc576` (post-TURN-I1)
  - `LATEST_COMMIT`: `50d0f0a` ("feat(I2,I3,I4): app auth gate + real login + sidebar user chip")
  - Files touched: `project/app.jsx` (+39/−10), `project/login.jsx` (+131/−27), `project/shell.jsx` (+45/−27), `project/brand.jsx` (+2)

- **FINDINGS**:
  - `app.jsx`'in mevcut route makinesi (`landing → login → qr → app`) auth state'inden bağımsız — sign-out sonrası kullanıcı hâlâ `'app'`'te kalır, sign-in olmuş kullanıcı reopen sonrası landing/login'i görür. Çözüm: useEffect ile auth-state-driven route bouncer. Edge case: ilk auth snapshot resolve olana kadar `ready=false` boyunca splash render edilmeli — yoksa returning user'lar kısa süre "logged out" UI göriyor, jarring.
  - `login.jsx`'teki form alanları yeterli (email/pw/remember) ama: hata banner slot'u yok, register modu yok, "Şifremi unuttum" anchor'u dummy. DiaSAGE'in `qr-link.js:84-123` 'sini referans aldım — toggle pattern, error display, password reset wire-up.
  - `shell.jsx:36-43` user-chip hardcoded "Dr. Kullanıcı / Endokrinoloji". `displayName` artık Firebase'den geliyor; initials hesaplaması (split-by-whitespace, ilk harfler, slice(0,2)) düzgün fallback ile DiaSAGE'in DR-fallback'i ile uyumlu.
  - `brand.jsx`'in I icon registry'sinde `logout` simgesi yoktu — eklendi (door + arrow). `eye` simgesi de eklendi (gelecek password-visibility toggle için yedek).

- **CHANGES**:
  - `project/app.jsx:18-22` — `useFirebaseAuth()` defansif çağrı (kalıp: line 14'teki `useTweaks` pattern'i).
  - `project/app.jsx:25-39` — auth-state-driven route effect: signed-in users on landing/login → setRoute('app')+setPage('dashboard'); signed-out users on app/qr → setRoute('landing').
  - `project/app.jsx:79-82` — `if (!auth.ready) return <splash/>` — flash önler.
  - `project/app.jsx:84-95` — `userName/userEmail/handleSignOut` hesaplaması.
  - `project/app.jsx:99-117` — `<Login>`'den `onLogin` prop'u kaldırıldı; `<Sidebar>`'a auth-derived prop'lar pass.
  - `project/login.jsx` — tam rewrite: mode toggle (`signin`|`signup`), `displayName` field (signup-only), error banner + info banner, `handleForgot` (`window.resetPassword`), submit branches (`signIn` vs `signUp`), `mapAuthError` ile TR hata mesajları, `onLogin` prop drop.
  - `project/shell.jsx:15-58` — Sidebar new props (`userName`, `userEmail`, `onSignOut`); initials computed; sign-out icon-button opt-in.
  - `project/brand.jsx:75-76` — `logout` ve `eye` SVG icon'ları eklendi.

- **CHALLENGE**: N/A.

- **VERIFICATION** (TURN-I7'de browser matris test edilecek; bu turun'un sınırlı kontrolü):
  - JSX hatası yok (Babel parse başarılı, sayfa render olur).
  - `<Login onLogin>` prop drop'u uyumlu — eski caller (`app.jsx`) artık prop pass etmiyor; component da kullanmıyor.
  - Manuel tarayıcı testi (kullanıcının yapması beklenir): (a) Firebase Console'dan manuel user yarat → reload → otomatik 'app' route'a düşer; (b) `<Login>`'den signup flow → /doctors/{uid} oluşur; (c) yanlış şifre → TR hata banner; (d) "Şifremi unuttum" → resetPassword e-postası; (e) Settings (Phase 6 sonrası) → "Çıkış Yap" → landing'e bounce.

- **Evidence**:
  - `project/app.jsx:25-39` — auth-state effect with route logic
  - `project/login.jsx:31-58` — submit branches signIn/signUp + mapAuthError
  - `project/login.jsx:60-77` — handleForgot + resetPassword
  - `project/shell.jsx:16-22` — initials calculation
  - `project/shell.jsx:46-56` — sign-out icon-button opt-in
  - DiaSAGE `qr-link.js:84-123` — referans uygulama (TR error map: `qr-link.js:114-118`)

- **I2/I3/I4 durumu**: AGREED (self) — pending USER browser verification + CODEX review.

- **Handoff**: CLAUDE WORKING→ON_HOLD, CODEX ON_HOLD→START.

### TURN-I3 (CLAUDE)

- **Header**: PART IMPL · RESPONDS_TO TURN-P1 · POINTS I5,I6 · COVERS P7,P8

- **Commit info**:
  - `BRANCH`: main
  - `BASE_COMMIT`: `50d0f0a` (post-TURN-I2)
  - `LATEST_COMMIT`: `b60e6b9` ("feat(I5,I6): real QR session + Settings profile/sign-out")
  - Files touched: `project/qr.jsx` (full rewrite, +252/−112), `project/pages.jsx` (Settings only, +112/−33)

- **FINDINGS**:
  - Mevcut `qr.jsx`'teki dekoratif SVG `QrPattern` (~30 satır) tamamen atılmalı — gerçek QR DOM-based kütüphane (qrcodejs) gerektiriyor (canvas/img mount'u). React-friendly çözüm: `useRef` + `useEffect`, cleanup'ta `node.innerHTML = ''`.
  - Step state machine'ın setTimeout-driven oluşu (`qr.jsx:5-9`) status-driven olmalı. Pure mapping `status → step` UI'da 0/1 ayrımını kaybeder (status sadece pending/confirmed). 1.5s grace period ekleyerek pending → 0 (hemen) → 1 (1.5s sonra) verdim — kullanıcıya "kod hazırlandı, şimdi tarama bekleniyor" görsel ilerlemesi.
  - DiaSAGE `qr-link.js:147-155` schema'sı verbatim kopyalandı: alan adları (`doctorUid`, `doctorEmail`, `doctorName`, `status`, `token`, `createdAt`, `expiresAt`), token formatı (32-hex), TTL (30 dk). Mobil app aynı schema'yı bekleyeceği için sapma kabul edilemez.
  - `Settings` üzerinde DiaSAGE schema'sından **iki ek alan** ekledim: `institution` ve `specialty`. Bunlar additive — Firestore'da ekstra field'lar diğer code path'leri kırmıyor (DiaSAGE'in patient-monitor.js'i bu alanları okumuyor). Plan'da bu özellikle yer almıyordu ama hardcoded UI'ı ("Hastane / Klinik", "Endokrinoloji") gerçek yapmak için minimum müdahale.

- **CHANGES**:
  - `project/qr.jsx:1-260` (full rewrite) — useFirebaseAuth → 4 useEffect (create session, onSnapshot listener, qrcodejs render, countdown) + grace-period effect. Deep-link `diaagent://link?...`. "Yeni Kod" version-counter regenerate. Error/expired/initializing overlays.
  - `project/pages.jsx:405-545` (Settings only) — controlled inputs (displayName/institution/specialty/email-readonly), `handleSave` → `doctors/{uid}.set(..., {merge:true})` + `auth.user.updateProfile({displayName})` align, `handleSignOut` → `window.signOutUser()`, "Oturum" 3rd card with destructive-styled button.

- **CHALLENGE**: 
  - Settings'e `institution`/`specialty` eklemek plan agent'ın "controlled inputs from profile" notu dışında bir genişleme. Justification: hardcoded UI'ı kaldırırken sadece displayName için input bırakmak UX gerilemesi olurdu (3 input → 1 input). Field'lar additive, schema'yı kırmıyor. Eğer CODEX review'da bu reject edilirse field'lar Settings UI'ından silinir, displayName ile sınırlı kalır.

- **VERIFICATION** (browser-required; matrix in TURN-P1 PROPOSAL):
  - QR oluşturma: `/qr` route'a git → Firestore Console `linkSessions` koleksiyonunda yeni doc, `status:'pending'`, valid 32-hex token, `expiresAt` ~30 dk ileride.
  - QR DOM: `.qr-frame > div > img` (qrcodejs default render olarak `<img>` üretir), src base64 PNG. Telefon kamerasıyla okutulduğunda `diaagent://link?sessionId=…&token=…` decode edilir.
  - Status flip simülasyonu: Firestore Console → `linkSessions/{sid}.status` `'pending'` → `'confirmed'` ve `patientUid: 'TEST'` ekle → UI ~1s içinde step 2'ye geçer, "Panele Git" butonu görünür.
  - Expiry simülasyonu: Console → `expiresAt = Date.now() - 1000` → UI overlay "Süre doldu — Yeni Kod".
  - Settings save: edit name → "Kaydet" → /doctors/{uid} merge → reload → Sidebar chip yeni isimle render.
  - Sign-out: Settings → "Çıkış Yap" → landing'e bounce; reopen tab otomatik sign-in olmaz (persistence respect ediliyor).

- **Evidence**:
  - `project/qr.jsx:54-72` — Firestore session write (DiaSAGE schema verbatim)
  - `project/qr.jsx:75-82` — deep-link construction (`diaagent://link?...`)
  - `project/qr.jsx:99-114` — onSnapshot listener
  - `project/qr.jsx:117-135` — qrcodejs render with cleanup
  - `project/qr.jsx:138-148` — countdown + auto-expire
  - `project/pages.jsx:436-456` — handleSave with `set({merge:true})` + Auth profile align
  - `project/pages.jsx:458-468` — handleSignOut
  - DiaSAGE `qr-link.js:147-155` — schema source-of-truth
  - DiaSAGE `qr-link.js:181-206` — onSnapshot listener pattern source

- **I5/I6 durumu**: AGREED (self) — pending USER browser verification + CODEX review.

- **AGREE_FINAL_IMPLEMENTATION**: YES (CLAUDE) — pending CODEX ACK on TURN-I1/I2/I3 and USER's I7 browser-verification matrix.

- **Handoff**: CLAUDE WORKING→ON_HOLD, CODEX ON_HOLD→START.

### TURN-I4 (CODEX)

- **Header**: PART IMPL · RESPONDS_TO TURN-I1,TURN-I2,TURN-I3 · POINTS I1,I2,I5,I6,I8,I9,I10,I11

- **Commit info**:
  - `BRANCH`: main
  - `BASE_COMMIT`: `b60e6b9` (last project-code commit under review)
  - `LATEST_COMMIT`: `0b0a58d` (board-only docs commit before this review edit)
  - Files reviewed: `project/firebase-config.js`, `project/auth-helpers.jsx`, `project/GlucoRING.html`, `project/GlucoRING-standalone.html`, `project/GlucoRING (Standalone).html`, `project/app.jsx`, `project/login.jsx`, `project/shell.jsx`, `project/brand.jsx`, `project/qr.jsx`, `project/pages.jsx`, `README.md`

- **FINDINGS**:
  - I1 is not final-ACKed. The two planned shell files (`GlucoRING.html`, `GlucoRING-standalone.html`) have the expected Firebase/qrcode/helper loading order, but the repo README identifies `project/GlucoRING (Standalone).html` as the primary handoff file the user had open. That tracked file has no `firebase-config`, `auth-helpers`, Firebase CDN, or qrcodejs references. If the user opens the primary standalone artifact, the Firebase integration is absent and the old bundled prototype path remains. This is blocking unless PRIMARY explicitly deprecates/removes/redirects that file.
  - I2/I3/I4 mostly match the planned auth helper surface: sign-in, sign-up, reset password, remember persistence, user chip, and sign-out are wired by inspection. However, the new auth gate sends signed-in users from `landing`/`login` directly to `app`; the original mock flow was `login -> qr -> app`. If first sign-in is supposed to force/continue QR pairing, the current route logic bypasses that flow and the real QR page is only reachable later via sidebar/tweaks. This needs a product decision or route fix.
  - I5 is not final-ACKed. QR session creation matches the DiaSAGE field names and deep-link scheme, but the listener only reacts to `data.status === 'confirmed'`. It ignores remote `expiresAt` changes, while the verification matrix explicitly says setting `expiresAt = Date.now() - 1000` in Firestore Console should drive the UI into expired state. Current expiry uses only the locally cached `session.expiresAt`, so that test will fail until the snapshot handler reads `data.expiresAt`.
  - I6 is acceptable by review for the requested Settings/profile/sign-out scope. The extra `institution` and `specialty` fields are additive and do not appear to break the DiaSAGE schema.
  - I11 is a non-blocking risk: `useFirebaseAuth()` waits for the doctor profile fetch before setting `ready=true`. Since `app.jsx` renders a blank splash while `ready=false`, slow/blocked Firestore profile reads can keep the whole app blank after Auth has already resolved. The existing catch eventually handles rejections, so this is deferred unless browser testing shows a stall.

- **CHALLENGE**:
  - I8 blocks final implementation ACK because the documented primary standalone artifact is not wired.
  - I9 blocks final implementation ACK because one planned browser verification case cannot pass with the current `qr.jsx` logic.
  - I10 blocks only if the intended post-login journey remains `login -> qr -> app`; PRIMARY should either restore that route or record a decision that QR pairing is now an in-app action after login.

- **PROPOSAL**:
  - I8: Either regenerate/update `project/GlucoRING (Standalone).html` with the new Firebase/qrcode/auth/helper code, or mark it deprecated and make it redirect to `GlucoRING-standalone.html`. Because README calls it primary, leaving it stale is unsafe.
  - I9: In the `onSnapshot` callback, read `data.expiresAt`; if it is numeric and `<= Date.now()`, set `status='expired'`, update `remainingMs`, and stop treating the QR as pending. Optionally update local `session.expiresAt` when Firestore changes it.
  - I10: If QR pairing must occur immediately after login, change the signed-in public-route bounce to `setRoute('qr')` for the fresh login path, while preserving persisted returning users going to `app`. If QR is intended as a menu action, update the board Done/verification wording so the route behavior is explicit.
  - I11: Prefer setting `ready=true` after the Auth snapshot is known, then fetch `doctors/{uid}` as profile hydration. Callers can render with Auth user fallback while profile loads.

- **Evidence**:
  - `README.md:9` — says to read `project/GlucoRING (Standalone).html` because it is almost certainly the primary design.
  - `rg -n "firebase-config|auth-helpers|firebasejs|qrcodejs" "project/GlucoRING (Standalone).html"` — returned no matches.
  - `project/GlucoRING.html:26-31` and `project/GlucoRING-standalone.html:71-76` — correct Firebase/qrcode/helper tags exist only in those two files.
  - `project/app.jsx:28-31` — signed-in public route bounces directly to `app`.
  - `project/app.jsx:102-104` — `login` and `qr` are separate top-level routes, but successful login no longer calls `setRoute('qr')`.
  - `project/qr.jsx:96-106` — snapshot handler only checks confirmed status/patientUid.
  - `project/qr.jsx:139-144` — expiry is computed from local `session.expiresAt`, not updated Firestore data.
  - `project/auth-helpers.jsx:89-102` and `project/app.jsx:83-84` — profile fetch completes before `ready=true`; app renders blank until then.
  - `project/pages.jsx:431-441` — Settings profile save is merge-only and additive.

- **Review result**: CHANGES_REQUESTED. CODEX does not ACK final implementation until I8 and I9 are fixed, and I10 is fixed or explicitly decided.

- **Handoff**: CODEX WORKING→ON_HOLD, CLAUDE ON_HOLD→START.

<!-- I7: USER must run the verification matrix in a browser. Test cases enumerated in TURN-P1 PROPOSAL "VERIFICATION". Until then, I7 stays OPEN. -->
