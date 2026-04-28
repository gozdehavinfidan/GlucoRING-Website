// Landing page — scroll-driven ring rotation + product sections

// Mobile app gallery — fan of 3 screens → click → horizontal scrollable strip of all screens
const APP_SHOTS = [
  { src: 'assets/app/mobile-sign-in.png', t: 'Giriş' },
  { src: 'assets/app/mobile-pairing.png', t: 'Eşleştirme' },
  { src: 'assets/app/mobile-medicine-reminder.png', t: 'İlaç Hatırlatma' },
  { src: 'assets/app/mobile-new-medicine-reminder.png', t: 'Yeni Hatırlatma' },
  { src: 'assets/app/mobile-home.png', t: 'Ana Ekran' },
];

const AppGallery = () => {
  const [expanded, setExpanded] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const galleryRef = React.useRef(null);
  const total = APP_SHOTS.length;
  const prev = () => setActive(i => (i - 1 + total) % total);
  const next = () => setActive(i => (i + 1) % total);
  // Keyboard nav when expanded
  React.useEffect(() => {
    if (!expanded) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  React.useEffect(() => {
    if (!expanded || !galleryRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      galleryRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [expanded]);

  return (
    <div ref={galleryRef} className={`app-gallery ${expanded ? 'expanded' : ''}`}>
      {!expanded && (
        <button className="app-fan" onClick={() => setExpanded(true)} aria-label="Galeriyi aç">
          <div className={`app-screen s1 ${APP_SHOTS[0].fit || ''}`}><img src={APP_SHOTS[0].src} alt="" loading="lazy" decoding="async"/></div>
          <div className={`app-screen s2 ${APP_SHOTS[1].fit || ''}`}><img src={APP_SHOTS[1].src} alt="" loading="lazy" decoding="async"/></div>
          <div className={`app-screen s3 ${APP_SHOTS[2].fit || ''}`}><img src={APP_SHOTS[2].src} alt="" loading="lazy" decoding="async"/></div>
          <span className="fan-hint">
            <I name="arrow" size={14}/> Tüm ekranları gör
          </span>
        </button>
      )}
      {expanded && (
        <div className="cover-wrap">
          <button className="cover-close" onClick={() => setExpanded(false)} aria-label="Kapat">
            <I name="close" size={16} stroke={2}/>
          </button>
          <button className="cover-nav prev" onClick={prev} aria-label="Önceki">
            <I name="chevR" size={20} stroke={2}/>
          </button>
          <div className="cover-stage">
            {APP_SHOTS.map((s, i) => {
              // Shortest signed distance on a loop
              let d = i - active;
              if (d > total / 2) d -= total;
              if (d < -total / 2) d += total;
              const abs = Math.abs(d);
              const visible = abs <= 3;
              const scale = abs === 0 ? 1 : abs === 1 ? 0.72 : abs === 2 ? 0.56 : 0.44;
              // Exponential spacing so outer screens clear the center without overlap
              const tx = d === 0 ? 0 : Math.sign(d) * (240 + (abs - 1) * 150);
              const rot = d === 0 ? 0 : d * 8;
              const opacity = visible ? (abs === 0 ? 1 : abs === 1 ? 0.5 : 0.2) : 0;
              const z = 10 - abs;
              return (
                <button
                  key={i}
                  className={`cover-item ${s.fit || ''} ${abs === 0 ? 'active' : ''}`}
                  onClick={() => setActive(i)}
                  style={{
                    transform: `translate(-50%, -50%) translateX(${tx}px) scale(${scale}) rotateY(${rot}deg)`,
                    opacity,
                    zIndex: z,
                    pointerEvents: visible ? 'auto' : 'none',
                    filter: abs === 0 ? 'none' : 'grayscale(0.5)',
                  }}
                  aria-label={s.t}
                  tabIndex={abs === 0 ? 0 : -1}
                >
                  <img src={s.src} alt={s.t} loading="lazy" decoding="async"/>
                </button>
              );
            })}
          </div>
          <button className="cover-nav next" onClick={next} aria-label="Sonraki">
            <I name="chevR" size={20} stroke={2}/>
          </button>
          <div className="cover-dots">
            {APP_SHOTS.map((_, i) => (
              <button
                key={i}
                className={`cover-dot ${i === active ? 'active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={`Ekran ${i+1}`}
              />
            ))}
          </div>
          <div className="cover-caption">
            <div className="cc-label mono">Ekran · {String(active+1).padStart(2,'0')} / {String(total).padStart(2,'0')}</div>
            <div className="cc-title">{APP_SHOTS[active].t}</div>
          </div>
        </div>
      )}
    </div>
  );
};

const Landing = ({ onEnter }) => {
  const [frame, setFrame] = React.useState(1);
  const [section, setSection] = React.useState(-1);
  const stageRef = React.useRef(null);
  const TOTAL_FRAMES = 240;

  // Preload all frames so scroll-driven rotation is buttery smooth
  React.useEffect(() => {
    const imgs = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const im = new Image();
      im.src = `assets/ring/f-${String(i).padStart(3,'0')}.png`;
      imgs.push(im);
    }
  }, []);

  React.useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!stageRef.current) return;
        const rect = stageRef.current.getBoundingClientRect();
        const scrolled = -rect.top;
        const max = stageRef.current.offsetHeight - window.innerHeight;
        const p = Math.max(0, Math.min(1, scrolled / max));
        const f = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(p * (TOTAL_FRAMES - 1)) + 1));
        setFrame(f);
        let sec = -1;
        if (p > 0.18) sec = Math.min(3, Math.floor((p - 0.18) / 0.205));
        setSection(sec);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const frameStr = String(frame).padStart(3, '0');

  const sections = [
    {
      eye: 'I. KAYIT',
      h: 'Akıllı yüzük 7/24 vücudunuzu okur.',
      p: 'Kalp atışı, vücut sıcaklığı, kandaki oksijen, hareket ve uyku — parmağınızdan doğrudan, kesintisiz olarak ölçülür. Kalibrasyon yapmanıza gerek yoktur.',
      bullets: [
        ['Kalp Atışı', 'Sürekli'],
        ['Oksijen Doygunluğu', 'Sürekli'],
        ['Vücut Sıcaklığı', 'Hassas ölçüm'],
        ['Hareket', 'Aktivite takibi'],
      ],
    },
    {
      eye: 'II. TAHMİN',
      h: 'Mevsime duyarlı glukoz tahmini.',
      p: 'Akıllı tahmin modelimiz her hastaya kendi vücuduna göre uyarlanır. Yaz, kış ve kişisel profiller arasında otomatik geçiş yapar.',
      bullets: [
        ['5 dk\'lık Tahmin', 'Anlık'],
        ['15 dk\'lık Tahmin', 'Kısa vadeli'],
        ['30 dk\'lık Tahmin', 'Erken uyarı'],
        ['Kişisel Profil', 'Otomatik'],
      ],
    },
    {
      eye: 'III. GÖZLEM',
      h: 'Doktorunuzla şeffaf paylaşım.',
      p: 'Hasta, QR kod ile doktoruna erişim izni verir. Veri akışı uçtan uca şifrelidir; izinleri istediği an geri alabilir.',
      bullets: [
        ['Yetkilendirme', 'QR + Onay'],
        ['Şifreleme', 'Uçtan uca'],
        ['Erişim', 'KVKK Uyumlu'],
        ['Geri Alma', 'Anlık'],
      ],
    },
    {
      eye: 'IV. MÜDAHALE',
      h: 'Risk öncesi uyarı.',
      p: 'Düşük veya yüksek glukoz seviyeleri 30 dakika öncesinden öngörülür. Doktor panelinde sade, eyleme dönük bildirimler görüntülenir.',
      bullets: [
        ['Erken Uyarı', '30 dk öncesinden'],
        ['Anlık Tahmin', '5 dakika'],
        ['Kısa Vadeli', '15 dakika'],
        ['Orta Vadeli', '30 dakika'],
      ],
    },
  ];

  // 9 health parameters tracked by the ring + watch
  const params = [
    { k: 'Nabız',        v: '78',      u: 'BPM',    d: 'MAX30100 PPG sensörü ile sürekli kalp atışı takibi', ico: 'pulse' },
    { k: 'SpO₂',         v: '97',      u: '%',      d: 'Kan oksijen doygunluğu ölçümü, hipoksi uyarısı',    ico: 'wave'  },
    { k: 'Vücut Sıcaklığı', v: '36.5', u: '°C',    d: 'MLX90614 temassız kızılötesi sensör',                ico: 'therm' },
    { k: 'Tansiyon',     v: '118/76',  u: 'mmHg',   d: 'Sistolik / diastolik kan basıncı takibi',            ico: 'gauge' },
    { k: 'Adım Sayısı',  v: '8,432',   u: 'adım',   d: 'Hareket sensörü ile günlük aktivite takibi',         ico: 'step'  },
    { k: 'Kalori',       v: '245',     u: 'kcal',   d: 'Harcanan kalori tahmini, diyet yönetimi desteği',    ico: 'flame' },
    { k: 'HRV',          v: '68',      u: 'ms',     d: 'Kalp hızı değişkenliği, stres ve otonom sinir',      ico: 'line'  },
    { k: 'Uyku',         v: '7.5',     u: 'saat',   d: 'Uyku süresi ve kalitesi analizi',                    ico: 'moon'  },
    { k: 'Glukoz Tahmini', v: '112',   u: 'mg/dL',  d: 'Fizyolojik veriden hesaplanan 5/15/30 dk öngörü',    ico: 'drop'  },
  ];

  return (
    <div className="landing">
      <nav className="landing-nav">
        <Logo size={26}/>
        <div className="landing-nav-links">
          <a href="#ring">Yüzük</a>
          <a href="#params">Parametreler</a>
          <a href="#mobile-app">Mobil Uygulama</a>
          <a href="#model">Tahmin Modeli</a>
          <a href="#panel">Doktor Paneli</a>
        </div>
        <div className="row gap-12">
          <button
            className="theme-toggle"
            onClick={() => {
              const root = document.documentElement;
              const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
              if (next === 'light') root.setAttribute('data-theme', 'light');
              else root.removeAttribute('data-theme');
              try { localStorage.setItem('gr-theme', next); } catch (e) {}
              window.dispatchEvent(new Event('gr-theme-change'));
            }}
            aria-label="Tema değiştir"
            title="Açık / Koyu tema"
          >
            <svg className="t-sun"  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            <svg className="t-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>
          <button className="btn-pill ghost" onClick={onEnter}>Doktor Girişi</button>
        </div>
      </nav>

      <div className="scroll-rail">
        {[-1, 0, 1, 2, 3].map(i => (
          <div key={i} className={`tick ${section === i ? 'active' : ''}`}/>
        ))}
      </div>

      <div className="scroll-stage" ref={stageRef}>
        <div className="scroll-sticky">
          <div className="ring-canvas">
            <img src={`assets/ring/f-${frameStr}.png`} alt="GlucoRING"/>
            <div className="ring-vignette"/>
          </div>

          <div className="scroll-overlay" style={{ opacity: section === -1 ? 1 : 0, transition: 'opacity 0.4s', pointerEvents: section === -1 ? 'auto' : 'none' }}>
            <div>
              <span className="hero-eyebrow">GlucoRING · Giyilebilir Sağlık Teknolojisi</span>
              <h1 className="hero-title">Glukoz,<br/><em>parmağınızdan</em><br/>okunur.</h1>
            </div>
            <div className="hero-meta">
              <p className="hero-sub">
                GlucoRING akıllı yüzük ve mobil uygulama ekosistemi; nabız, oksijen, sıcaklık ve daha fazlasını anlık olarak izler. Fizyolojik verilerden mevsime duyarlı glukoz tahmini üretir, doktorunuzla paylaşmanıza izin verir.
              </p>
            </div>
          </div>

          <button
            className="skip-scroll"
            onClick={() => {
              const el = document.getElementById('ring');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            aria-label="Animasyonu atla, doğrudan ürün bilgilerine git"
          >
            <span>Animasyonu atla</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {sections.map((s, i) => (
            <div key={i} className={`scroll-section ${section === i ? 'active' : ''}`}>
              <div className="left">
                <div className="scroll-eyebrow">{s.eye}</div>
                <h2 className="scroll-h">{s.h}</h2>
                <p className="scroll-p">{s.p}</p>
                <div className="feature-list">
                  {s.bullets.map(([k, v]) => (
                    <div key={k} className="feature-row">
                      <span className="dot"/>
                      <span className="label">{k}</span>
                      <span className="val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="right"/>
            </div>
          ))}
        </div>
      </div>

      {/* ===== RING product section ===== */}
      <section id="ring" className="landing-section">
        <div className="section-head">
          <span className="section-eye">I. DONANIM</span>
          <h2 className="section-h">Kompakt sağlık takip <em>yüzüğü</em>.</h2>
          <p className="section-sub">GlucoRING ekosisteminin çekirdek giyilebilir cihazı. Parmağınızdan kesintisiz fizyolojik veri toplar, BLE 5.0 ile mobil uygulamaya senkronize eder. Glukoz tahmin modelimizin anahtarı bu yüzüktür.</p>
        </div>
        <div className="hw-bento">
          <article className="hw-card hw-card--lg" style={{backgroundImage: 'url(assets/photos/ring-podium.png)'}}>
            <div className="hw-card-text">
              <span className="hw-eyebrow">Klinik Sensör Dizisi</span>
              <h3>Tıbbi sınıf sensörler<br/>tek bir yüzükte.</h3>
            </div>
          </article>

          <article className="hw-card hw-card--dark hw-card--md">
            <div className="hw-card-text">
              <span className="hw-eyebrow">7/24 İzleme</span>
              <h3>Gece gündüz<br/>kesintisiz takip.</h3>
              <p>Nabız, SpO₂, sıcaklık, hareket — uyurken bile.</p>
            </div>
            <div className="hw-pulse-viz" aria-hidden="true">
              <span className="pv-ring pv-ring-1"/>
              <span className="pv-ring pv-ring-2"/>
              <span className="pv-ring pv-ring-3"/>
              <span className="pv-core"/>
            </div>
          </article>

          <article className="hw-card hw-card--md hw-card--ble">
            <div className="hw-card-text">
              <span className="hw-eyebrow">Kablosuz Bağlantı</span>
              <h3>Telefonla<br/>anlık senkron.</h3>
              <p>Düşük enerji tüketimli kablosuz teknoloji — internet bağlantısı gerekmez.</p>
            </div>
            <div className="hw-ble-viz" aria-hidden="true">
              <span className="ble-wave w1"/>
              <span className="ble-wave w2"/>
              <span className="ble-wave w3"/>
            </div>
          </article>

          <article className="hw-card hw-card--lg hw-card--photo" style={{backgroundImage: 'url(assets/photos/ring-hand-glucose.png)'}}>
            <div className="hw-card-text hw-card-text--bottom">
              <span className="hw-eyebrow">Akıllı Tahmin</span>
              <h3>Glukoz seviyenizi<br/>önceden gösterir.</h3>
            </div>
          </article>

        </div>
      </section>

      {/* ===== 9 PARAMETERS ===== */}
      <section id="params" className="landing-section bg-panel">
        <div className="section-head">
          <span className="section-eye">II. PARAMETRELER</span>
          <h2 className="section-h">Gerçek zamanlı <em>sağlık takibi</em>.</h2>
          <p className="section-sub">Akıllı yüzük ve opsiyonel akıllı saat kombinasyonundan toplanan verilerin birleşimiyle toplamda <strong>9 farklı sağlık parametresini</strong> sürekli olarak izleyin.</p>
        </div>
        <div className="params-bento">
          {/* Featured hero — Glukoz Tahmini */}
          <div className="pb-card pb-hero">
            <div className="pb-live"><span className="pb-dot"/>CANLI</div>
            <div className="pb-hero-top">
              <span className="pb-eyebrow mono">09 / GLUKOZ TAHMİNİ</span>
              <h3>Bir sonraki<br/>30 dakika.</h3>
              <p>Fizyolojik sinyallerden hesaplanan kişisel öngörü. Erken risk uyarısı.</p>
            </div>
            <div className="pb-hero-readout">
              <div className="pb-hero-val">
                <span className="num mono">112</span>
                <span className="u">mg/dL</span>
              </div>
              <div className="pb-hero-trend">
                <span className="trend-arrow">↗</span>
                <span className="trend-label">Hafif yükseliş</span>
              </div>
            </div>
            <svg className="pb-hero-chart" viewBox="0 0 400 110" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="pbHeroFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(230,57,70,0.45)"/>
                  <stop offset="100%" stopColor="rgba(230,57,70,0)"/>
                </linearGradient>
              </defs>
              <path d="M0,80 L40,72 L80,76 L120,60 L160,55 L200,62 L240,48 L280,42 L320,38 L360,30 L400,24 L400,110 L0,110 Z" fill="url(#pbHeroFill)"/>
              <path d="M0,80 L40,72 L80,76 L120,60 L160,55 L200,62 L240,48 L280,42 L320,38 L360,30 L400,24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
              <circle cx="400" cy="24" r="4" fill="var(--accent)"/>
              <circle cx="400" cy="24" r="9" fill="var(--accent)" opacity="0.3"/>
            </svg>
            <div className="pb-hero-axis mono">
              <span>şimdi</span><span>+10dk</span><span>+20dk</span><span>+30dk</span>
            </div>
          </div>

          {/* Pulse — animated heartbeat */}
          <div className="pb-card pb-pulse-card">
            <div className="pb-card-head">
              <span className="pb-num mono">01</span>
              <span className="pb-name">Nabız</span>
            </div>
            <div className="pb-big">
              <span className="num mono pb-pulse-num">78</span>
              <span className="u">BPM</span>
            </div>
            <svg className="pb-ekg" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0,30 L40,30 L48,30 L52,12 L58,48 L64,30 L100,30 L108,30 L112,12 L118,48 L124,30 L160,30 L168,30 L172,12 L178,48 L184,30 L200,30" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
            </svg>
          </div>

          {/* SpO2 — radial */}
          <div className="pb-card pb-spo2-card">
            <div className="pb-card-head">
              <span className="pb-num mono">02</span>
              <span className="pb-name">SpO₂</span>
            </div>
            <div className="pb-radial">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--line)" strokeWidth="6"/>
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" strokeDasharray="263.9" strokeDashoffset="7.9" transform="rotate(-90 50 50)"/>
              </svg>
              <div className="pb-radial-center">
                <span className="num mono">97</span>
                <span className="u">%</span>
              </div>
            </div>
          </div>

          {/* Vücut Sıcaklığı — thermometer */}
          <div className="pb-card pb-temp-card">
            <div className="pb-card-head">
              <span className="pb-num mono">03</span>
              <span className="pb-name">Sıcaklık</span>
            </div>
            <div className="pb-temp">
              <div className="pb-thermo">
                <div className="pb-thermo-fill"/>
                <span className="pb-thermo-mark" style={{bottom:'30%'}}/>
                <span className="pb-thermo-mark" style={{bottom:'60%'}}/>
              </div>
              <div className="pb-big">
                <span className="num mono">36.5</span>
                <span className="u">°C</span>
              </div>
            </div>
          </div>

          {/* Tansiyon */}
          <div className="pb-card pb-bp-card">
            <div className="pb-card-head">
              <span className="pb-num mono">04</span>
              <span className="pb-name">Tansiyon</span>
            </div>
            <div className="pb-bp">
              <div className="pb-bp-row"><span className="lbl mono">SİS</span><span className="num mono">118</span></div>
              <div className="pb-bp-row"><span className="lbl mono">DİA</span><span className="num mono">76</span></div>
              <div className="pb-bp-bar"><div className="fill"/></div>
            </div>
          </div>

          {/* Adım — bar chart */}
          <div className="pb-card pb-steps-card">
            <div className="pb-card-head">
              <span className="pb-num mono">05</span>
              <span className="pb-name">Adım</span>
            </div>
            <div className="pb-big">
              <span className="num mono">8,432</span>
              <span className="u">adım</span>
            </div>
            <div className="pb-bars" aria-hidden="true">
              {[40,55,30,72,48,90,65].map((h,i)=>(
                <span key={i} className="pb-bar" style={{height:`${h}%`,animationDelay:`${i*0.08}s`}}/>
              ))}
            </div>
          </div>

          {/* Kalori — flame ring */}
          <div className="pb-card pb-cal-card">
            <div className="pb-card-head">
              <span className="pb-num mono">06</span>
              <span className="pb-name">Kalori</span>
            </div>
            <div className="pb-big">
              <span className="num mono">245</span>
              <span className="u">kcal</span>
            </div>
            <div className="pb-cal-bar">
              <div className="pb-cal-fill"/>
              <span className="pb-cal-tick mono">hedef · 500</span>
            </div>
          </div>

          {/* HRV — sparkline */}
          <div className="pb-card pb-hrv-card">
            <div className="pb-card-head">
              <span className="pb-num mono">07</span>
              <span className="pb-name">HRV</span>
            </div>
            <div className="pb-big">
              <span className="num mono">68</span>
              <span className="u">ms</span>
            </div>
            <svg className="pb-spark" viewBox="0 0 200 50" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0,30 L20,28 L40,32 L60,22 L80,28 L100,18 L120,24 L140,16 L160,22 L180,14 L200,18" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Uyku — moon arc */}
          <div className="pb-card pb-sleep-card">
            <div className="pb-card-head">
              <span className="pb-num mono">08</span>
              <span className="pb-name">Uyku</span>
            </div>
            <div className="pb-sleep">
              <svg viewBox="0 0 120 60" aria-hidden="true">
                <path d="M10,55 A50,50 0 0,1 110,55" fill="none" stroke="var(--line)" strokeWidth="4"/>
                <path d="M10,55 A50,50 0 0,1 110,55" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeDasharray="157" strokeDashoffset="20"/>
              </svg>
              <div className="pb-big">
                <span className="num mono">7.5</span>
                <span className="u">sa</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MOBILE APP ===== */}
      <section id="mobile-app" className="landing-section">
        <div className="app-showcase">
          <div className="app-copy">
            <span className="section-eye">III. MOBİL UYGULAMA</span>
            <h2 className="section-h">Hastanın cebinde <em>tüm sistem</em>.</h2>
            <p>GlucoRING mobil uygulaması; akıllı yüzük ile kablosuz olarak haberleşir, verileri yerel olarak işler ve doktor paneline güvenli şekilde aktarır. İnternet bağlantısı gerektirmeden çalışır.</p>
            <div className="app-feature-list">
              <div className="app-feat">
                <span className="af-ico"><I name="bluetooth" size={16}/></span>
                <div>
                  <h5>Kablosuz eşleştirme</h5>
                  <p>Akıllı saat veya yüzük ile tek dokunuşla bağlanır, otomatik senkronize olur.</p>
                </div>
              </div>
              <div className="app-feat">
                <span className="af-ico"><I name="bell" size={16}/></span>
                <div>
                  <h5>İlaç hatırlatıcıları</h5>
                  <p>Doz, birim, kullanım saati ve bildirim yönetimi. Hafta bazında takip.</p>
                </div>
              </div>
              <div className="app-feat">
                <span className="af-ico"><I name="shield" size={16}/></span>
                <div>
                  <h5>Yerel veri saklama</h5>
                  <p>Sağlık verileri önce cihazda tutulur, yalnızca hasta onayı ile doktora iletilir.</p>
                </div>
              </div>
              <div className="app-feat">
                <span className="af-ico"><I name="qr" size={16}/></span>
                <div>
                  <h5>QR ile doktor eşleşmesi</h5>
                  <p>Doktor panelindeki QR kodu uygulamadan tarayarak veri paylaşımını etkinleştirin.</p>
                </div>
              </div>
            </div>
          </div>
          <AppGallery/>
        </div>
      </section>

      {/* ===== PREDICTION MODEL ===== */}
      <section id="model" className="landing-section bg-panel">
        <div className="section-head narrow">
          <span className="section-eye">IV. TAHMİN MODELİ</span>
          <h2 className="section-h">Mevsime duyarlı <em>hibrit tahmin</em>.</h2>
          <p className="section-sub">Gelişmiş tahmin algoritmalarımız, her hastanın kendine özel glukoz seyrini öğrenerek erken risk uyarısı üretir. 5, 15 ve 30 dakikalık tahminler birlikte çalışır.</p>
        </div>
        <div className="model-grid">
          <article className="model-card">
            <div className="model-card-head">
              <span className="horizon mono">5 dk</span>
            </div>
            <div className="model-name">Yakın vade tahmin</div>
            <div className="model-desc">Yemek bolus'u, hızlı egzersiz öncesi ve uyku sırasında glukoz hareketinin anlık yönü için.</div>
            <svg className="model-chart" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0,40 L25,38 L50,36 L75,32 L100,30 L125,26 L150,24 L175,22 L200,20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="200" cy="20" r="4" fill="currentColor"/>
            </svg>
            <ul className="model-bullets">
              <li>Hata payı düşük</li>
              <li>BLE ile gecikmesiz</li>
            </ul>
          </article>
          <article className="model-card">
            <div className="model-card-head">
              <span className="horizon mono">15 dk</span>
            </div>
            <div className="model-name">Orta vade öngörü</div>
            <div className="model-desc">Yemek sonrası glukoz tepkisi, aktivite/dinlenme geçişleri ve mevsimsel insülin yanıtı için.</div>
            <svg className="model-chart" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0,42 L25,40 L50,32 L75,22 L100,18 L125,22 L150,28 L175,26 L200,24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="200" cy="24" r="4" fill="currentColor"/>
            </svg>
            <ul className="model-bullets">
              <li>Yemek pencereli</li>
              <li>Mevsim profili</li>
            </ul>
          </article>
          <article className="model-card">
            <div className="model-card-head">
              <span className="horizon mono">30 dk</span>
            </div>
            <div className="model-name">Uzun vade risk</div>
            <div className="model-desc">Hipo/hiperglisemi olaylarını yarım saat öncesinden işaretler — klinik müdahale penceresi açar.</div>
            <svg className="model-chart" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0,30 L25,32 L50,28 L75,20 L100,14 L125,10 L150,8 L175,6 L200,4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="200" cy="4" r="4" fill="currentColor"/>
              <circle cx="200" cy="4" r="9" fill="currentColor" opacity="0.3"/>
            </svg>
            <ul className="model-bullets">
              <li>Otomatik bildirim</li>
              <li>Hekim panelinde kayıt</li>
            </ul>
          </article>
        </div>
        <section className="season-section">
          <div className="season-head">
            <span className="sb-eye mono">MEVSİM MODELİ</span>
            <h3>Vücut, mevsime göre <em>farklı tepki</em> verir.</h3>
            <p>Sıcakta damarlar genişler, terle birlikte glukoz dengesi değişir; soğukta tam tersi olur. GlucoRING; ortam ve aktivite verilerinizi okur, üç farklı tahmin profili arasında otomatik geçiş yapar — zamanla en doğru olanı kişisel verinizden öğrenir.</p>
          </div>
          <div className="season-grid">
            <article className="season-card season-card--summer">
              <div className="season-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4.2" fill="currentColor" fillOpacity="0.18"/><path d="M12 2v2.5M12 19.5V22M4.22 4.22l1.77 1.77M18.01 18.01l1.77 1.77M2 12h2.5M19.5 12H22M4.22 19.78l1.77-1.77M18.01 5.99l1.77-1.77"/></svg>
              </div>
              <div className="season-tag mono">YAZ PROFİLİ</div>
              <h4>Sıcak hava modeli</h4>
              <p>Sıcakta dolaşım hızlanır, glukoz emilimi artar. Model, hızlı düşüşleri ve hipoglisemi riskini erken algılayacak biçimde uyarlanır.</p>
              <ul className="season-stats">
                <li><span className="mono">Sıcak</span> Ortam profili</li>
                <li><span className="mono">Hızlı</span> Vücut tepkisi</li>
                <li><span className="mono">Erken</span> Risk algısı</li>
              </ul>
            </article>
            <article className="season-card season-card--winter">
              <div className="season-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M3.34 7l17.32 10M3.34 17l17.32-10"/><path d="M9 4l3 2 3-2M9 20l3-2 3 2M3.5 9l1.5 2.5L3.5 14M20.5 9L19 11.5l1.5 2.5M9.5 12l2.5 1.5 2.5-1.5"/></svg>
              </div>
              <div className="season-tag mono">KIŞ PROFİLİ</div>
              <h4>Soğuk hava modeli</h4>
              <p>Soğukta damarlar daralır, insülin yanıtı yavaşlar. Model, gecikmeli yükselişleri ve hiperglisemi pencerelerini öngörecek biçimde ayarlanır.</p>
              <ul className="season-stats">
                <li><span className="mono">Soğuk</span> Ortam profili</li>
                <li><span className="mono">Yavaş</span> Vücut tepkisi</li>
                <li><span className="mono">Gecikmeli</span> Risk algısı</li>
              </ul>
            </article>
            <article className="season-card season-card--personal">
              <div className="season-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 3c0 5 16 5 16 8s-16 3-16 8"/><path d="M20 3c0 5-16 5-16 8s16 3 16 8"/><path d="M7 7h10M7 17h10M9 11h6"/></svg>
              </div>
              <div className="season-tag mono">KİŞİSEL PROFİL</div>
              <h4>Hastaya özel model</h4>
              <p>Sistem zaman içinde kişisel hareket, uyku ve fizyolojik ritminizi öğrenir. Hibrit model, sizin verinize göre en doğru çıkanı ön plana çıkarır.</p>
              <ul className="season-stats">
                <li><span className="mono">Sürekli</span> Öğrenme</li>
                <li><span className="mono">Çoklu sinyal</span> Girdi</li>
                <li><span className="mono">Hibrit</span> Model ağırlığı</li>
              </ul>
            </article>
          </div>
          <div className="season-foot mono">
            <span className="dot s-dot"/>OTOMATİK GEÇİŞ · Sıcaklık &amp; aktivite eşiklerine bağlı, manuel ayar gerekmez
          </div>
        </section>
      </section>

      {/* ===== SECURITY ===== */}
      <section id="panel" className="landing-section">
        <div className="security-split">
          <div>
            <span className="section-eye">V. GÜVENLİK & PAYLAŞIM</span>
            <h2 className="section-h">Hasta verisi, <em>hastanın iznine</em> bağlı.</h2>
            <p className="section-sub">Her veri paylaşımı hasta tarafında QR onayı ile başlar, istenildiği an iptal edilebilir. GlucoRING, KVKK ve klinik veri saklama standartları doğrultusunda çalışır.</p>
          </div>
          <div className="security-cards">
            <div className="sec-card">
              <div className="sec-ico"><I name="qr" size={18}/></div>
              <h4>QR ile yetkilendirme</h4>
              <p>Doktor paneldeki kodu hastanın uygulaması tarar — eşleşme hasta tarafından onaylanır.</p>
            </div>
            <div className="sec-card">
              <div className="sec-ico"><I name="lock" size={18}/></div>
              <h4>Uçtan uca şifreli</h4>
              <p>Veri hem aktarımda hem depoda şifrelidir. Üst düzey güvenlik standartları uygulanır.</p>
            </div>
            <div className="sec-card">
              <div className="sec-ico"><I name="shield" size={18}/></div>
              <h4>KVKK uyumlu</h4>
              <p>Hasta onayı olmadan hiçbir üçüncü tarafa veri aktarılmaz.</p>
            </div>
            <div className="sec-card">
              <div className="sec-ico"><I name="x" size={18}/></div>
              <h4>Anında iptal</h4>
              <p>Hasta, uygulamasından doktor erişimini tek dokunuşla durdurabilir.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS — 3-step flow that reads top-to-bottom ===== */}
      <section className="landing-howitworks">
        <div className="section-head narrow">
          <span className="section-eye">VI. NASIL ÇALIŞIR</span>
          <h2 className="section-h">Hasta ile doktor arasında <em>üç adım</em>.</h2>
          <p className="section-sub">Tüm akış, kullanıcı dostu olacak şekilde tasarlandı: yüzüğü tak, uygulamayı kur, doktor panelinde QR ile eşleş.</p>
        </div>
        <ol className="hiw-steps">
          <li className="hiw-step">
            <div className="hiw-num mono">01</div>
            <h4>Yüzüğü tak, uygulamayı aç</h4>
            <p>Mobil uygulama yüzüğü otomatik bulur, BLE 5.0 üzerinden eşleştirme tek dokunuşla biter. Kalibrasyon gerekmez.</p>
          </li>
          <li className="hiw-step">
            <div className="hiw-num mono">02</div>
            <h4>Doktor panelindeki QR'ı tara</h4>
            <p>Hasta, uygulamasındaki tarayıcı ile doktorun panelindeki QR kodunu tarar, paylaşımı tek dokunuşla onaylar. Erişimi istediği an iptal edebilir.</p>
          </li>
          <li className="hiw-step">
            <div className="hiw-num mono">03</div>
            <h4>Veri klinik panelde canlı görünür</h4>
            <p>Şifreli kanaldan gelen fizyolojik akış, hekimin gösterge tablosuna gerçek zamanlı işlenir. 5/15/30 dk glukoz tahminleri ile risk uyarıları otomatik üretilir.</p>
          </li>
        </ol>
      </section>

      {/* ===== FOR-CLINICIANS VALUE PROPS — what the panel actually delivers ===== */}
      <section className="landing-value">
        <div className="section-head narrow">
          <span className="section-eye">VII. KLİNİSYEN İÇİN</span>
          <h2 className="section-h">Klinik karar desteği, <em>tek panelde</em>.</h2>
          <p className="section-sub">GlucoRING doktor paneli; hasta listenizi, fizyolojik trendleri ve glukoz risk olaylarını tek bir okunabilir arayüzde toplar.</p>
        </div>
        <div className="value-grid">
          <article className="value-card value-card--primary">
            <div className="value-ico"><I name="pulse" size={20}/></div>
            <h3>Sürekli izleme</h3>
            <p>Yüzükten gelen 9 parametre, hasta bazında 24 saatlik trend grafikleriyle özetlenir. Ölçüm aralıklarına manuel müdahale gerekmez.</p>
            <span className="value-meta mono">9 parametre · 24 saat</span>
          </article>
          <article className="value-card value-card--secondary">
            <div className="value-ico"><I name="bell" size={20}/></div>
            <h3>Erken uyarı bildirimleri</h3>
            <p>30 dakika öncesinden öngörülen düşük/yüksek glukoz olayları panelinizde sıralı bildirim olarak görünür. Eyleme dönük, sayısal eşiklerle.</p>
            <span className="value-meta mono">5 / 15 / 30 dk</span>
          </article>
          <article className="value-card value-card--tertiary">
            <div className="value-ico"><I name="shield" size={20}/></div>
            <h3>KVKK uyumlu paylaşım</h3>
            <p>Her veri akışı hasta onayına bağlıdır, uçtan uca şifrelenir ve denetim kaydı tutulur. Üçüncü taraf erişimi yoktur.</p>
            <span className="value-meta mono">Uçtan uca şifreli</span>
          </article>
          <article className="value-card value-card--warning">
            <div className="value-ico"><I name="line" size={20}/></div>
            <h3>Klinik raporlama</h3>
            <p>Hasta bazlı haftalık ve aylık rapor çıktısı; muayene öncesi tek bakışta seyir özeti almanızı sağlar.</p>
            <span className="value-meta mono">Haftalık · Aylık · PDF</span>
          </article>
        </div>
      </section>

      {/* ===== FAQ — user-voiced questions, GlucoRING-positioned answers ===== */}
      <section className="landing-faq">
        <div className="section-head narrow">
          <span className="section-eye">VIII. SIK SORULAR</span>
          <h2 className="section-h">Bilmek istediğiniz <em>her şey</em>.</h2>
        </div>
        <div className="faq-grid">
          <details className="faq-item">
            <summary>GlucoRING'in klasik parmak delgisinden farkı ne?</summary>
            <p>Parmak delgisinde gün içinde sadece birkaç ölçüm yapabiliyorsunuz; aralarda ne olduğunu bilemezsiniz. GlucoRING ise yüzüğün içindeki sensörlerle <strong>7 gün 24 saat</strong> nabız, oksijen, sıcaklık, hareket gibi 9 fizyolojik sinyali sürekli okur ve bu sinyallerden glukoz tahmini üretir. İğne yok, kan örneği yok — yüzük parmağınızda durduğu sürece veri akıyor.</p>
          </details>
          <details className="faq-item">
            <summary>Mevsime özel tahmin tam olarak nasıl çalışıyor?</summary>
            <p>Vücudunuz yazın ve kışın aynı insülin tepkisini vermez: sıcakta damarlar genişler, glukoz emilimi hızlanır; soğukta tam tersi olur. GlucoRING bunu önemser — <strong>Yaz, Kış ve Kişisel</strong> olmak üzere üç ayrı tahmin modeli vardır. Sistem ortam sıcaklığınızı ve hareket örüntünüzü okur, hangi modelin sizin için en doğru tahmini ürettiğini öğrenir, otomatik olarak aralarında geçiş yapar. Bunu siz ayarlamazsınız.</p>
          </details>
          <details className="faq-item">
            <summary>Verilerimi benim dışımda kim görebilir?</summary>
            <p>Sadece <strong>siz onayladığınız doktor</strong>, sadece siz onayladığınız sürece. Süreç şöyle: doktorunuzun panelinde bir QR kodu çıkar, GlucoRING uygulamanızla bu kodu tararsınız, tek dokunuşla onaylarsınız. O andan itibaren doktorunuz verilerinizi görür. İstediğiniz an aynı uygulamadan tek dokunuşla iptal edebilirsiniz; doktorunuzun erişimi anında kapanır. GlucoRING ekibi dahil hiç kimse, sizin onayınız olmadan verilerinize bakamaz.</p>
          </details>
          <details className="faq-item">
            <summary>Yüzük şarj gerektiriyor mu, ne kadar dayanıyor?</summary>
            <p>Düşük enerji tüketimli sensör mimarisi sayesinde tek şarjla <strong>5–7 gün</strong> kullanırsınız. Yatağınızın yanındaki magnetik şarj kaidesinin üzerine bırakırsınız, <strong>90 dakikada</strong> tam dolar — yani genelde duş aldığınız sürede zaten şarj olur, gün içinde bir kez bile aklınıza gelmez.</p>
          </details>
          <details className="faq-item">
            <summary>Yemek bolus'u veya tedavi kararını GlucoRING'e göre alabilir miyim?</summary>
            <p>GlucoRING erken uyarı ve trend takibi için tasarlanmıştır — bir sonraki 30 dakikada glukozunuzun nereye gittiğini söyler. Ancak <strong>tedavi kararları (insülin dozu, ilaç düzenlemesi) hekim ve laboratuvar ölçümlerine</strong> bağlıdır. GlucoRING'in işi, bu kararları doğru zamanda almanız için sizi ve doktorunuzu erken bilgilendirmektir.</p>
          </details>
          <details className="faq-item">
            <summary>İnternet kesilirse ne oluyor, veri kaybı yaşar mıyım?</summary>
            <p>Hayır. Yüzükten gelen veri önce telefonunuzdaki uygulamada <strong>yerel olarak işlenir</strong>; tahminler ve uyarılar internet olmadan da çalışmaya devam eder. İnternet geri geldiğinde uygulama, biriken kayıtları sizin onayınız doğrultusunda doktor paneline senkronize eder. Yani uçakta, kırsalda, asansörde — fark etmez.</p>
          </details>
          <details className="faq-item">
            <summary>Doktorum panelde tam olarak neyi görüyor?</summary>
            <p>Onayladığınız andan itibaren doktorunuz, GlucoRING klinik panelinde hasta listesinde sizi görür ve <strong>glukoz seyrinizi, 9 fizyolojik parametrenizin trendlerini ve risk olaylarını</strong> tek bir okunabilir arayüzde takip eder. 5/15/30 dakikalık tahminler ve hipo/hiper uyarıları otomatik bildirim olarak panele düşer; doktor haftalık ve aylık özet raporları muayene öncesinde tek bakışta inceleyebilir.</p>
          </details>
          <details className="faq-item">
            <summary>Hangi telefonlarda çalışıyor?</summary>
            <p>iOS 15+ veya Android 9+ olan her telefonda. Doktor paneli ise tarayıcıdan açılır — Chrome, Safari, Edge — kurulum gerekmez. Bilgisayarınız yoksa hekiminiz tablete veya telefona da girebilir.</p>
          </details>
        </div>
      </section>

      {/* ===== Final CTA — full-width illustrated hero with content overlaid ===== */}
      <section className="landing-cta">
        <div className="cta-bg" aria-hidden="true">
          <div className="cta-blob cta-blob-1"/>
          <div className="cta-blob cta-blob-2"/>
          <div className="cta-blob cta-blob-3"/>
          <div className="cta-grid"/>
          <div className="cta-scrim"/>
          <div className="cta-pill cta-pill-1 mono"><span className="dot"/>Glukoz · 112 mg/dL</div>
          <div className="cta-pill cta-pill-2 mono"><span className="dot"/>SpO₂ · 97%</div>
          <div className="cta-pill cta-pill-3 mono"><span className="dot"/>Nabız · 78 bpm</div>
          <div className="cta-pill cta-pill-4 mono"><span className="dot"/>HRV · 68 ms</div>
          <div className="cta-pill cta-pill-5 mono"><span className="dot"/>Sıcaklık · 36.5°C</div>
          <div className="cta-pill cta-pill-6 mono"><span className="dot"/>Tansiyon · 118/76</div>
        </div>
        <div className="cta-copy">
          <span className="section-eye">DOKTOR PANELİ</span>
          <h2>Hastalarınızı <em>tek panelden</em> izleyin.</h2>
          <p>Kayıtlı hastalarınızın glukoz seyrini, fizyolojik trendlerini ve risk olaylarını güvenli, okunabilir bir klinik arayüzde takip edin. Kurulum gerekmez — tarayıcıdan giriş yapmanız yeterli.</p>
          <div className="ctas">
            <button className="btn-pill btn-accent" onClick={onEnter}>Doktor Paneline Giriş</button>
            <button className="btn-pill ghost">Akademik Dokümanlar</button>
          </div>
          <ul className="cta-trust">
            <li><span className="dot"/>KVKK uyumlu</li>
            <li><span className="dot"/>Uçtan uca şifreli</li>
            <li><span className="dot"/>Tarayıcı tabanlı, kurulum gerekmez</li>
          </ul>
        </div>
      </section>

      <footer className="landing-foot">
        <div className="lf-grid">
          <div className="lf-brand">
            <Logo size={28}/>
            <p>Giyilebilir glukoz tahmin ekosistemi. Akıllı yüzük + mobil uygulama + klinik panel.</p>
          </div>
          <div className="lf-col">
            <h6>Ürün</h6>
            <a href="#ring">Yüzük</a>
            <a href="#params">Parametreler</a>
            <a href="#mobile-app">Mobil Uygulama</a>
            <a href="#model">Tahmin Modeli</a>
          </div>
          <div className="lf-col">
            <h6>Klinisyen</h6>
            <a href="#panel">Güvenlik & Paylaşım</a>
            <a onClick={onEnter} role="button">Doktor Paneline Giriş</a>
            <a>Klinik Yönerge</a>
            <a>Akademik Dokümanlar</a>
          </div>
          <div className="lf-col">
            <h6>Yasal</h6>
            <a>KVKK Aydınlatma</a>
            <a>Kullanım Koşulları</a>
            <a>Çerez Politikası</a>
            <a>İletişim</a>
          </div>
        </div>
        <div className="lf-bottom">
          <span>© 2026 GlucoRING Research · Tüm hakları saklıdır.</span>
          <span className="mono">v0.9.2-beta</span>
        </div>
      </footer>
    </div>
  );
};

window.Landing = Landing;
