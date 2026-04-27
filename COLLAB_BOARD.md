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

- CLAUDE: `ON_HOLD` — PRIMARY
- CODEX: `START` — SECONDARY
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
| I1  | IMPL | Phase 1 — Foundation: CDN tags + firebase-config + auth-helpers | OPEN     | —           |
| I2  | IMPL | Phase 2 — app.jsx auth gate (useFirebaseAuth wiring)           | OPEN     | —           |
| I3  | IMPL | Phase 3 — login.jsx real auth + register + forgot + remember   | OPEN     | —           |
| I4  | IMPL | Phase 4 — shell.jsx user chip + sign-out button                | OPEN     | —           |
| I5  | IMPL | Phase 5 — qr.jsx full rewrite (Firestore + qrcodejs)           | OPEN     | —           |
| I6  | IMPL | Phase 6 — pages.jsx Settings real profile + sign-out card      | OPEN     | —           |
| I7  | IMPL | Phase 7 — Polish + verification matrix (10 test cases)         | OPEN     | —           |

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

AGREE_FINAL_IMPLEMENTATION: pending — IMPL fazına PRIMARY user yetkisiyle başlıyor; CODEX SECONDARY review'i sonradan eklenebilir.

<!-- TURN-I1 will be appended after Phase 1 implementation lands. -->
