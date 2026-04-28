// QR Pairing flow — wired to Firestore /linkSessions. Generates a real
// session doc, renders a real QR via qrcodejs, and listens for patient-app
// confirmation via onSnapshot. Deep-link scheme is
// `diaagent://link?sessionId=…&token=…`, which the mobile companion app
// resolves to authorize data sharing.

const QR_SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

const generateHexToken = (lenBytes) => {
  const arr = new Uint8Array(lenBytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
};

const formatRemaining = (ms) => {
  if (ms <= 0) return '0:00';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const QrPairing = ({ onDone }) => {
  const auth = (typeof useFirebaseAuth === 'function')
    ? useFirebaseAuth()
    : { user: null, profile: null, ready: true };

  const [version, setVersion] = React.useState(0);     // bump to regenerate
  const [session, setSession] = React.useState(null);   // {sessionId, token, expiresAt, deepLink}
  const [status, setStatus] = React.useState('initializing'); // initializing | pending | confirmed | expired | error
  const [errorMsg, setErrorMsg] = React.useState('');
  const [remainingMs, setRemainingMs] = React.useState(QR_SESSION_TTL_MS);

  const qrRef = React.useRef(null);

  // Effect 1 — create a Firestore session whenever `version` bumps (or on
  // mount). The doc shape is what the mobile companion app expects.
  React.useEffect(() => {
    if (!auth.ready) return;
    const user = auth.user;
    if (!user) {
      setStatus('error');
      setErrorMsg('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }

    let cancelled = false;
    setStatus('initializing');
    setErrorMsg('');
    setSession(null);

    (async () => {
      try {
        const sessionId = (crypto.randomUUID && crypto.randomUUID()) || generateHexToken(16);
        const token = generateHexToken(16);
        const createdAt = Date.now();
        const expiresAt = createdAt + QR_SESSION_TTL_MS;
        const doctorName = (auth.profile && auth.profile.displayName) || user.displayName || '';

        await window.fbDb.collection('linkSessions').doc(sessionId).set({
          doctorUid: user.uid,
          doctorEmail: user.email || '',
          doctorName,
          status: 'pending',
          token,
          createdAt,
          expiresAt,
        });

        if (cancelled) return;

        const deepLink = 'diaagent://link?sessionId=' + encodeURIComponent(sessionId)
          + '&token=' + encodeURIComponent(token);
        setSession({ sessionId, token, expiresAt, deepLink });
        setRemainingMs(expiresAt - Date.now());
        setStatus('pending');
      } catch (err) {
        if (cancelled) return;
        console.error('[qr] session create failed:', err);
        setStatus('error');
        setErrorMsg('Oturum oluşturulamadı. Tekrar deneyin.');
      }
    })();

    return () => { cancelled = true; };
  }, [version, auth.ready, auth.user]);

  // Effect 2 — onSnapshot on /linkSessions/{sessionId}; advance to
  // 'confirmed' when the patient app writes status:'confirmed' + patientUid.
  React.useEffect(() => {
    if (!session || !session.sessionId) return;
    if (status !== 'pending') return;

    const unsub = window.fbDb.collection('linkSessions').doc(session.sessionId)
      .onSnapshot((snap) => {
        if (!snap.exists) return;
        const data = snap.data();
        if (data.status === 'confirmed') {
          setStatus('confirmed');
          // Optional: stash patientUid for downstream handoff to monitor.
          if (data.patientUid) {
            try { window.__lastConfirmedPatientUid = data.patientUid; } catch (_) {}
          }
        }
      }, (err) => {
        console.error('[qr] onSnapshot error:', err);
        setStatus('error');
        setErrorMsg('Bağlantı hatası. Tekrar deneyin.');
      });

    return () => { try { unsub(); } catch (_) {} };
  }, [session, status]);

  // Effect 3 — render a REAL QR into qrRef via the qrcodejs CDN lib.
  React.useEffect(() => {
    if (!session || !qrRef.current) return;
    if (typeof window.QRCode !== 'function') {
      console.error('[qr] QRCode global missing — qrcodejs CDN tag not loaded');
      return;
    }
    const node = qrRef.current;
    node.innerHTML = '';
    // eslint-disable-next-line no-new
    new window.QRCode(node, {
      text: session.deepLink,
      width: 220,
      height: 220,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: window.QRCode.CorrectLevel ? window.QRCode.CorrectLevel.M : 1,
    });
    return () => { node.innerHTML = ''; };
  }, [session]);

  // Effect 4 — countdown + auto-expire.
  React.useEffect(() => {
    if (!session || status !== 'pending') return;
    const tick = () => {
      const left = session.expiresAt - Date.now();
      setRemainingMs(left);
      if (left <= 0) setStatus('expired');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session, status]);

  // Step state for the existing 3-step UI:
  //   0 = code generated (initial pending)
  //   1 = waiting for patient confirmation
  //   2 = confirmed
  // We collapse 0/1 onto 'pending' since the contract only distinguishes
  // pending vs confirmed; 0 → 1 transition fires once after a short grace
  // period to give the user visual progress.
  const [hasGracePassed, setHasGracePassed] = React.useState(false);
  React.useEffect(() => {
    setHasGracePassed(false);
    if (status !== 'pending') return;
    const t = setTimeout(() => setHasGracePassed(true), 1500);
    return () => clearTimeout(t);
  }, [session, status]);

  let step = 0;
  if (status === 'confirmed') step = 2;
  else if (status === 'pending' && hasGracePassed) step = 1;

  const regenerate = () => setVersion(v => v + 1);

  const sessionLabel = session
    ? 'SESSION · ' + (session.sessionId || '').replace(/-/g, '').slice(0, 18).toUpperCase()
    : 'SESSION · ————————————————';

  return (
    <div className="qr-stage">
      <div className="qr-card">
        <div className="qr-left">
          <Logo size={26}/>
          <h2>Hasta Eşleştirme</h2>
          <p>Bu QR kodu, hastanın kendi GlucoRING mobil uygulamasından taratıldığında veri paylaşımı yetkilendirilir. Erişim hasta tarafında her an iptal edilebilir.</p>

          <div className="steps">
            <div className={`step ${step >= 0 ? 'active' : ''} ${step >= 1 ? 'done' : ''}`}>
              <div className="num">{step >= 1 ? <I name="check" size={12}/> : '1'}</div>
              <div>
                <h5>QR kod oluşturuldu</h5>
                <p>Geçici, tek kullanımlık kod 30 dk geçerli.</p>
              </div>
            </div>
            <div className={`step ${step >= 1 ? 'active' : ''} ${step >= 2 ? 'done' : ''}`}>
              <div className="num">{step >= 2 ? <I name="check" size={12}/> : '2'}</div>
              <div>
                <h5>Hasta uygulamadan tarat</h5>
                <p>"Hekiminle Paylaş" → kamera ekranını aç → bu kodu çerçevele.</p>
              </div>
            </div>
            <div className={`step ${step >= 2 ? 'active done' : ''}`}>
              <div className="num">{step >= 2 ? <I name="check" size={12}/> : '3'}</div>
              <div>
                <h5>Hasta onayı ile bağlantı kurulur</h5>
                <p>Yetkilendirme tamamlandığında hasta listenize eklenir.</p>
              </div>
            </div>
          </div>

          <div className="row gap-12 mt-28">
            <button className="btn-pill ghost" style={{ padding: '10px 18px' }} onClick={regenerate}>
              <I name="refresh" size={14}/> Yeni Kod
            </button>
            {step >= 2 && (
              <button className="btn-pill btn-accent" style={{ padding: '10px 20px' }} onClick={onDone}>
                Panele Git <I name="arrow" size={14}/>
              </button>
            )}
          </div>

          {status === 'error' && errorMsg && (
            <div
              role="alert"
              style={{
                marginTop: 16, padding: '10px 12px', borderRadius: 8,
                background: 'rgba(230,57,70,0.10)', color: '#ff7a82',
                border: '1px solid rgba(230,57,70,0.32)', fontSize: 13,
              }}
            >
              {errorMsg}
            </div>
          )}
        </div>

        <div className="qr-right">
          <div className="qr-frame" style={{ position: 'relative' }}>
            <div
              ref={qrRef}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 220, height: 220, background: '#fff', borderRadius: 12,
                padding: 0, margin: '0 auto',
              }}
            />
            {status === 'initializing' && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#666', fontSize: 13,
                background: 'rgba(255,255,255,0.6)', borderRadius: 12,
              }}>QR oluşturuluyor…</div>
            )}
            {status === 'expired' && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 600,
                background: 'rgba(10,14,12,0.78)', borderRadius: 12,
              }}>Süre doldu — Yeni Kod</div>
            )}
            {status === 'pending' && step < 2 && <div className="qr-scan-line"/>}
          </div>
          <div className="qr-meta">
            <div className="pid mono">{sessionLabel}</div>
            {status === 'initializing' && (
              <div className="stat-line"><span className="pdot"/> Oturum oluşturuluyor</div>
            )}
            {status === 'pending' && step < 1 && (
              <div className="stat-line"><span className="pdot"/> Tarama bekleniyor · Kalan {formatRemaining(remainingMs)}</div>
            )}
            {status === 'pending' && step === 1 && (
              <div className="stat-line"><span className="pdot"/> Hasta onayı bekleniyor · Kalan {formatRemaining(remainingMs)}</div>
            )}
            {status === 'confirmed' && (
              <div className="stat-line done"><I name="check" size={12}/> Eşleşme tamamlandı</div>
            )}
            {status === 'expired' && (
              <div className="stat-line"><span className="pdot"/> Süre doldu</div>
            )}
            {status === 'error' && (
              <div className="stat-line"><span className="pdot"/> Hata</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

window.QrPairing = QrPairing;
