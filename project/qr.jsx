// QR Pairing flow

const QrPairing = ({ onDone }) => {
  const [step, setStep] = React.useState(0); // 0: gen, 1: scanned, 2: confirmed
  React.useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 4500);
    const t2 = setTimeout(() => setStep(2), 8200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Static decorative QR — pseudo-random pattern
  const QrPattern = () => {
    const cells = [];
    const rng = (i, j) => ((i * 73 + j * 31 + i * j * 11) % 7) > 3;
    const size = 21;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        // Corner finders
        const isFinder = (i < 7 && j < 7) || (i < 7 && j >= size - 7) || (i >= size - 7 && j < 7);
        if (isFinder) continue;
        if (rng(i, j)) cells.push(<rect key={`${i}-${j}`} x={j * 10} y={i * 10} width="10" height="10" fill="#000"/>);
      }
    }
    const finder = (cx, cy) => (
      <g>
        <rect x={cx} y={cy} width="70" height="70" fill="#000"/>
        <rect x={cx + 10} y={cy + 10} width="50" height="50" fill="#fff"/>
        <rect x={cx + 20} y={cy + 20} width="30" height="30" fill="#000"/>
      </g>
    );
    return (
      <svg viewBox="0 0 210 210">
        {cells}
        {finder(0, 0)}
        {finder(140, 0)}
        {finder(0, 140)}
        {/* Center logo block */}
        <rect x="80" y="80" width="50" height="50" fill="#fff"/>
        <circle cx="105" cy="105" r="18" fill="#fff" stroke="#e63946" strokeWidth="3"/>
        <circle cx="105" cy="105" r="11" fill="#e63946"/>
      </svg>
    );
  };

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
                <p>Geçici, tek kullanımlık kod 5 dk geçerli.</p>
              </div>
            </div>
            <div className={`step ${step >= 1 ? 'active' : ''} ${step >= 2 ? 'done' : ''}`}>
              <div className="num">{step >= 2 ? <I name="check" size={12}/> : '2'}</div>
              <div>
                <h5>Hasta uygulamadan tarat</h5>
                <p>“Hekiminle Paylaş” → kamera ekranını aç → bu kodu çerçevele.</p>
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
            <button className="btn-pill ghost" style={{ padding: '10px 18px' }}>
              <I name="refresh" size={14}/> Yeni Kod
            </button>
            {step >= 2 && (
              <button className="btn-pill btn-accent" style={{ padding: '10px 20px' }} onClick={onDone}>
                Panele Git <I name="arrow" size={14}/>
              </button>
            )}
          </div>
        </div>

        <div className="qr-right">
          <div className="qr-frame">
            <QrPattern/>
            {step < 2 && <div className="qr-scan-line"/>}
          </div>
          <div className="qr-meta">
            <div className="pid mono">SESSION · 4F-9B2C-7AE3</div>
            {step < 1 && (
              <div className="stat-line"><span className="pdot"/> Tarama bekleniyor</div>
            )}
            {step === 1 && (
              <div className="stat-line"><span className="pdot"/> Hasta onayı bekleniyor</div>
            )}
            {step >= 2 && (
              <div className="stat-line done"><I name="check" size={12}/> Eşleşme tamamlandı</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

window.QrPairing = QrPairing;
