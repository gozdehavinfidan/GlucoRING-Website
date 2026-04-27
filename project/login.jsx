// Login screen

const Login = ({ onLogin, onBack }) => {
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const submit = (e) => {
    e?.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 700);
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
          <h1>Klinik İzlem Paneli</h1>
          <p className="sub">Yetkili sağlık profesyonelleri için. Hasta verilerine erişim, hastanın QR onayı ile etkinleşir.</p>

          <form onSubmit={submit}>
            <div className="field">
              <label>Kurumsal e-posta</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ad.soyad@hastane.gov.tr" required/>
            </div>
            <div className="field">
              <label>Şifre</label>
              <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••••" required/>
            </div>

            <div className="field-row">
              <label className="checkbox">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}/>
                <span className="box"/>
                <span>Beni hatırla</span>
              </label>
              <a href="#">Şifremi unuttum</a>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Doğrulanıyor…' : 'Güvenli Oturum Aç'}
            </button>
          </form>

          <div className="login-foot">
            <span className="lock"><I name="lock" size={14}/></span>
            <span>TLS 1.3 ile şifrelenmiştir · ISO 27001 · KVKK Uyumlu</span>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Login = Login;
