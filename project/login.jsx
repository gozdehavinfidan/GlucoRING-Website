// Login screen — wired to Firebase Auth via window.signIn / window.signUp /
// window.resetPassword (defined in auth-helpers.jsx). Route transitions are
// driven by the auth-state listener in app.jsx; this component does not call
// an `onLogin` callback anymore.

const Login = ({ onBack }) => {
  const [mode, setMode] = React.useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [info, setInfo] = React.useState('');

  const isSignup = mode === 'signup';

  const toggleMode = () => {
    setMode(isSignup ? 'signin' : 'signup');
    setError('');
    setInfo('');
  };

  const submit = async (e) => {
    e?.preventDefault();
    setError('');
    setInfo('');
    if (!email || !pw) {
      setError('E-posta ve şifre gerekli.');
      return;
    }
    if (isSignup && !displayName.trim()) {
      setError('Ad Soyad gerekli.');
      return;
    }
    setLoading(true);
    try {
      if (isSignup) {
        await window.signUp(email.trim(), pw, displayName.trim());
      } else {
        await window.signIn(email.trim(), pw, remember);
      }
      // Successful — route transition is handled by app.jsx auth listener.
    } catch (err) {
      const msg = (typeof window.mapAuthError === 'function')
        ? window.mapAuthError(err && err.code)
        : 'Bir hata oluştu.';
      setError(msg);
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e?.preventDefault();
    setError('');
    setInfo('');
    if (!email) {
      setError('Önce e-posta adresinizi girin.');
      return;
    }
    try {
      await window.resetPassword(email.trim());
      setInfo('Şifre sıfırlama bağlantısı e-postanıza gönderildi.');
    } catch (err) {
      const msg = (typeof window.mapAuthError === 'function')
        ? window.mapAuthError(err && err.code)
        : 'E-posta gönderilemedi.';
      setError(msg);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-art">
        <img src="assets/ring/f-001.png" alt=""/>
        <div className="overlay-grid"/>
        <div className="legend">
          <span className="v">●</span> SIM_FRAME · GLUCORING.RING.v2 · 1.04 mm CMOS
        </div>
      </div>
      <div className="login-form">
        <div className="login-card">
          <div className="top-mark">
            <Logo size={28}/>
            <button className="btn-pill ghost" onClick={onBack} style={{ fontSize: 12, padding: '6px 12px' }}>← Ana sayfa</button>
          </div>

          <div className="hero-eyebrow" style={{ marginBottom: 12 }}>HEKIM ERIŞIMI</div>
          <h1>{isSignup ? 'Yeni Hekim Hesabı' : 'Klinik İzlem Paneli'}</h1>
          <p className="sub">
            {isSignup
              ? 'Kurumsal e-posta adresinizle yeni bir hekim hesabı oluşturun. Hasta verilerine erişim, hastanın QR onayı ile etkinleşir.'
              : 'Yetkili sağlık profesyonelleri için. Hasta verilerine erişim, hastanın QR onayı ile etkinleşir.'}
          </p>

          <form onSubmit={submit}>
            {isSignup && (
              <div className="field">
                <label>Ad Soyad</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Dr. Ad Soyad"
                  autoComplete="name"
                  required={isSignup}
                />
              </div>
            )}
            <div className="field">
              <label>Kurumsal e-posta</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ad.soyad@hastane.gov.tr"
                autoComplete="email"
                required
              />
            </div>
            <div className="field">
              <label>Şifre</label>
              <input
                type="password"
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder={isSignup ? 'En az 6 karakter' : '••••••••••'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                required
              />
            </div>

            {!isSignup && (
              <div className="field-row">
                <label className="checkbox">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}/>
                  <span className="box"/>
                  <span>Beni hatırla</span>
                </label>
                <a href="#" onClick={handleForgot}>Şifremi unuttum</a>
              </div>
            )}

            {error && (
              <div
                role="alert"
                style={{
                  marginTop: 10, marginBottom: 4,
                  padding: '10px 12px', borderRadius: 8,
                  background: 'rgba(230,57,70,0.10)', color: '#ff7a82',
                  border: '1px solid rgba(230,57,70,0.32)',
                  fontSize: 13, lineHeight: 1.4,
                }}
              >
                {error}
              </div>
            )}
            {info && !error && (
              <div
                role="status"
                style={{
                  marginTop: 10, marginBottom: 4,
                  padding: '10px 12px', borderRadius: 8,
                  background: 'rgba(52,195,143,0.10)', color: '#7be3a3',
                  border: '1px solid rgba(52,195,143,0.32)',
                  fontSize: 13, lineHeight: 1.4,
                }}
              >
                {info}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? (isSignup ? 'Hesap oluşturuluyor…' : 'Doğrulanıyor…')
                : (isSignup ? 'Hesap Oluştur' : 'Güvenli Oturum Aç')}
            </button>
          </form>

          <div className="login-foot" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="lock"><I name="lock" size={14}/></span>
              <span>TLS 1.3 ile şifrelenmiştir · ISO 27001 · KVKK Uyumlu</span>
            </div>
            <div style={{ fontSize: 13 }}>
              {isSignup ? 'Zaten hesabınız var mı? ' : 'Hesabınız yok mu? '}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); toggleMode(); }}
                style={{ fontWeight: 600 }}
              >
                {isSignup ? 'Giriş yap' : 'Hesap oluştur'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Login = Login;
