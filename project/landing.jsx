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
          <p className="section-sub">Akıllı yüzükten toplanan fizyolojik verilerle toplamda <strong>9 farklı sağlık parametresini</strong> sürekli olarak izleyin.</p>
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

          {/* SpO2 — value centered, semi-arc gauge as graphic below */}
          <div className="pb-card pb-spo2-card">
            <div className="pb-card-head">
              <span className="pb-num mono">02</span>
              <span className="pb-name">SpO₂</span>
            </div>
            <div className="pb-big">
              <span className="num mono">97</span>
              <span className="u">%</span>
            </div>
            <svg className="pb-spo2-arc" viewBox="0 0 200 60" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
              <path d="M 14 54 C 14 4 186 4 186 54" fill="none" stroke="var(--line)" strokeWidth="6" strokeLinecap="round"/>
              <path d="M 14 54 C 14 4 186 4 186 54" fill="none" stroke="var(--accent)" strokeWidth="6"
                    strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset="3"/>
              <circle cx="186" cy="54" r="4" fill="var(--accent)"/>
            </svg>
          </div>

          {/* Vücut Sıcaklığı — value centered, horizontal thermometer bar below */}
          <div className="pb-card pb-temp-card">
            <div className="pb-card-head">
              <span className="pb-num mono">03</span>
              <span className="pb-name">Sıcaklık</span>
            </div>
            <div className="pb-big">
              <span className="num mono">36.5</span>
              <span className="u">°C</span>
            </div>
            <div className="pb-thermo-bar" aria-hidden="true">
              <div className="pb-thermo-bar-fill"/>
              <span className="pb-thermo-bar-mark" style={{ left: '50%' }}/>
              <span className="pb-thermo-bar-mark pb-thermo-bar-mark--key" style={{ left: '62.5%' }}/>
              <div className="pb-thermo-bar-axis mono">
                <span>34</span>
                <span>37.5</span>
                <span>40</span>
              </div>
            </div>
          </div>

          {/* Tansiyon — combined sys/dia value centered, range bar below */}
          <div className="pb-card pb-bp-card">
            <div className="pb-card-head">
              <span className="pb-num mono">04</span>
              <span className="pb-name">Tansiyon</span>
            </div>
            <div className="pb-big">
              <span className="num mono">118<span className="bp-sep">/</span>76</span>
              <span className="u">mmHg</span>
            </div>
            <div className="pb-bp-bar"><div className="fill"/></div>
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

          {/* Uyku — value centered, sleep arc as graphic below */}
          <div className="pb-card pb-sleep-card">
            <div className="pb-card-head">
              <span className="pb-num mono">08</span>
              <span className="pb-name">Uyku</span>
            </div>
            <div className="pb-big">
              <span className="num mono">7.5</span>
              <span className="u">sa</span>
            </div>
            <svg className="pb-sleep-arc" viewBox="0 0 200 60" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
              <path d="M 14 54 C 14 4 186 4 186 54" fill="none" stroke="var(--line)" strokeWidth="5" strokeLinecap="round"/>
              <path d="M 14 54 C 14 4 186 4 186 54" fill="none" stroke="var(--accent)" strokeWidth="5"
                    strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset="22"/>
              <circle cx="174" cy="22" r="4" fill="var(--accent)"/>
            </svg>
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
                  <p>Yüzük ile tek dokunuşla bağlanır, otomatik senkronize olur.</p>
                </div>
              </div>
              <div className="app-feat">
                <span className="af-ico"><I name="bell" size={16}/></span>
                <div>
                  <h5>İlaç hatırlatıcıları</h5>
                  <p>Doz, birim, kullanım saati ve bildirim yönetimi. Sürekli takip.</p>
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
                  <p>Doktor panelindeki QR kodu GlucoRING mobil uygulamasından tarayarak veri paylaşımını etkinleştirin.</p>
                </div>
              </div>
            </div>
          </div>
          <AppGallery/>
        </div>
      </section>

      {/* ===== PREDICTION MODEL — merged with seasonal sub-section ===== */}
      <section id="model" className="landing-section bg-panel">
        <div className="section-head narrow">
          <span className="section-eye">IV. TAHMİN MODELİ</span>
          <h2 className="section-h">Mevsime duyarlı <em>hibrit tahmin</em>.</h2>
          <p className="section-sub">Tahmin modeli <strong>mevsime göre otomatik adapte olur</strong>; her tahmin sizin verinize özelleştirilir. 5, 15 ve 30 dakikalık öngörüler birlikte üretilir.</p>
        </div>
        <div className="season-grid">
          <article className="season-card season-card--summer">
            <div className="season-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4.2" fill="currentColor" fillOpacity="0.18"/><path d="M12 2v2.5M12 19.5V22M4.22 4.22l1.77 1.77M18.01 18.01l1.77 1.77M2 12h2.5M19.5 12H22M4.22 19.78l1.77-1.77M18.01 5.99l1.77-1.77"/></svg>
            </div>
            <div className="season-tag mono">YAZ PROFİLİ</div>
            <h4>Sıcak hava modeli</h4>
            <p>Sıcak iklim koşullarına ayarlanmış tahmin profili.</p>
            <div className="season-curve-wrap">
              <svg className="season-curve" viewBox="0 0 220 60" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="seasonCurveSummer" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.30"/>
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <line x1="6" x2="214" y1="22" y2="22" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 4" opacity="0.32"/>
                <path d="M6,42 C 30,42 50,40 70,28 C 90,16 100,8 116,8 C 130,8 138,30 158,46 C 180,52 198,50 214,48"
                      fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6,42 C 30,42 50,40 70,28 C 90,16 100,8 116,8 C 130,8 138,30 158,46 C 180,52 198,50 214,48 L 214,60 L 6,60 Z"
                      fill="url(#seasonCurveSummer)"/>
                <circle cx="116" cy="8" r="3" fill="currentColor"/>
              </svg>
              <span className="season-curve-cap mono">YAZ MODELİ · TEMSİLİ ÇIKTI</span>
            </div>
          </article>
          <article className="season-card season-card--winter">
            <div className="season-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M3.34 7l17.32 10M3.34 17l17.32-10"/><path d="M9 4l3 2 3-2M9 20l3-2 3 2M3.5 9l1.5 2.5L3.5 14M20.5 9L19 11.5l1.5 2.5M9.5 12l2.5 1.5 2.5-1.5"/></svg>
            </div>
            <div className="season-tag mono">KIŞ PROFİLİ</div>
            <h4>Soğuk hava modeli</h4>
            <p>Soğuk iklim koşullarına ayarlanmış tahmin profili.</p>
            <div className="season-curve-wrap">
              <svg className="season-curve" viewBox="0 0 220 60" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="seasonCurveWinter" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.30"/>
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <line x1="6" x2="214" y1="22" y2="22" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 4" opacity="0.32"/>
                <path d="M6,46 C 28,46 50,44 76,40 C 102,36 124,30 146,22 C 168,14 188,12 214,12"
                      fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6,46 C 28,46 50,44 76,40 C 102,36 124,30 146,22 C 168,14 188,12 214,12 L 214,60 L 6,60 Z"
                      fill="url(#seasonCurveWinter)"/>
                <circle cx="214" cy="12" r="3" fill="currentColor"/>
              </svg>
              <span className="season-curve-cap mono">KIŞ MODELİ · TEMSİLİ ÇIKTI</span>
            </div>
          </article>
          <article className="season-card season-card--personal">
            <div className="season-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 3c0 5 16 5 16 8s-16 3-16 8"/><path d="M20 3c0 5-16 5-16 8s16 3 16 8"/><path d="M7 7h10M7 17h10M9 11h6"/></svg>
            </div>
            <div className="season-tag mono">KİŞİSEL PROFİL</div>
            <h4>Size özel model</h4>
            <p>Vücut ritminizi öğrenir, her zaman kişiselleştirilmiş tahmin üretir.</p>
            <div className="season-curve-wrap">
              <svg className="season-curve" viewBox="0 0 220 60" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="seasonCurvePersonal" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.30"/>
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <line x1="6" x2="214" y1="22" y2="22" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 4" opacity="0.32"/>
                <path d="M6,30 C 28,28 44,18 66,18 C 88,18 102,30 124,32 C 146,34 162,22 184,22 C 200,22 208,28 214,28"
                      fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6,30 C 28,28 44,18 66,18 C 88,18 102,30 124,32 C 146,34 162,22 184,22 C 200,22 208,28 214,28 L 214,60 L 6,60 Z"
                      fill="url(#seasonCurvePersonal)"/>
                <circle cx="214" cy="28" r="3" fill="currentColor"/>
              </svg>
              <span className="season-curve-cap mono">KİŞİSEL MODEL · TEMSİLİ ÇIKTI</span>
            </div>
          </article>
        </div>
        <div className="season-disclaimer">
          Yukarıdaki grafikler model davranışını anlatan temsili çıktıdır. Bireysel glikoz yanıtı kişiden kişiye farklılık gösterir.
        </div>
        <div className="season-foot mono">
          <span className="dot s-dot"/>OTOMATİK GEÇİŞ · Manuel ayar gerekmez, sistem verinizden öğrenir
        </div>
      </section>

      {/* ===== V. GÜVENLİK & PAYLAŞIM — Trust console ===== */}
      <section id="panel" className="landing-section bg-panel sec-section">
        <div className="section-head narrow">
          <span className="section-eye">V. GÜVENLİK & PAYLAŞIM</span>
          <h2 className="section-h">Hasta verisi, <em>hastanın iznine</em> bağlı.</h2>
          <p className="section-sub">Her paylaşım QR onayıyla başlar, istenildiği an iptal edilebilir. KVKK ve klinik veri saklama standartları doğrultusunda çalışır.</p>
        </div>
        <div className="sec-tgrid">
          {/* Card 1 — QR Authorization */}
          <article className="sec-tcard sec-tcard--red">
            <span className="sec-tcard-grain" aria-hidden="true"/>
            <span className="sec-tcard-aura" aria-hidden="true"/>
            <span className="sec-tcard-scan" aria-hidden="true"/>

            <header className="sec-tcard-rail">
              <span className="mono sec-stage">A1</span>
              <span className="sec-stage-rule" aria-hidden="true"/>
              <span className="mono sec-stage-label">YETKİLENDİRME</span>
            </header>

            <div className="sec-tcard-art" aria-hidden="true">
              <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet" className="sec-tart">
                {/* QR-style 5×5 grid with 3 corner finders */}
                {/* Corner finders */}
                {[
                  [10, 10], [142, 10], [10, 70],
                ].map(([cx, cy], i) => (
                  <g key={`f${i}`}>
                    <rect x={cx} y={cy} width="40" height="40" rx="4" fill="none" stroke="currentColor" strokeWidth="3"/>
                    <rect x={cx + 10} y={cy + 10} width="20" height="20" rx="2" fill="currentColor"/>
                  </g>
                ))}
                {/* Random data squares filling the rest */}
                {[
                  [70, 22], [86, 22], [102, 22], [118, 22],
                  [70, 38], [102, 38], [118, 38],
                  [70, 54], [86, 54], [118, 54],
                  [60, 80], [76, 80], [92, 80], [108, 80], [124, 80], [140, 80], [156, 80], [172, 80],
                  [60, 96], [92, 96], [124, 96], [156, 96], [172, 96],
                  [60, 112], [76, 112], [108, 112], [140, 112], [172, 112],
                ].map(([x, y], i) => (
                  <rect key={`d${i}`} x={x} y={y} width="10" height="10" fill="currentColor" opacity={0.55 + (i % 3) * 0.15}/>
                ))}
                {/* Animated scan beam */}
                <rect className="sec-tart-scan" x="0" y="0" width="200" height="3" fill="currentColor"/>
                {/* Auth checkmark badge in lower-right corner */}
                <g transform="translate(150, 70)">
                  <circle cx="22" cy="22" r="20" fill="currentColor" opacity="0.18"/>
                  <circle cx="22" cy="22" r="14" fill="currentColor"/>
                  <path d="M 16 22 L 21 27 L 30 17" fill="none" stroke="var(--panel)" strokeWidth="3"
                        strokeLinecap="round" strokeLinejoin="round"/>
                </g>
              </svg>
            </div>

            <h3 className="sec-tcard-name">QR ile yetkilendirme</h3>
            <p className="sec-tcard-desc">Doktor panelinde oluşan tek-kullanımlık kodu hasta uygulamasıyla tarar; eşleşme yalnızca hasta onayıyla aktif olur.</p>

            <div className="sec-tcard-pill mono">
              <span className="sec-pill-dot" aria-hidden="true"/>
              TEK KULLANIMLIK · 60 SN GEÇERLİ
            </div>
          </article>

          {/* Card 2 — End-to-End Encryption */}
          <article className="sec-tcard sec-tcard--blue">
            <span className="sec-tcard-grain" aria-hidden="true"/>
            <span className="sec-tcard-aura" aria-hidden="true"/>
            <span className="sec-tcard-scan" aria-hidden="true"/>

            <header className="sec-tcard-rail">
              <span className="mono sec-stage">A2</span>
              <span className="sec-stage-rule" aria-hidden="true"/>
              <span className="mono sec-stage-label">VERİ KORUMA</span>
            </header>

            <div className="sec-tcard-art" aria-hidden="true">
              <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet" className="sec-tart">
                {/* Two endpoints with glow + connecting encrypted channel */}
                <g>
                  {/* Left endpoint — phone */}
                  <rect x="14" y="34" width="32" height="52" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5"/>
                  <rect x="20" y="42" width="20" height="30" fill="currentColor" opacity="0.25"/>
                  <circle cx="30" cy="80" r="2" fill="currentColor"/>

                  {/* Right endpoint — server/cloud */}
                  <g transform="translate(154, 34)">
                    <rect x="0" y="0" width="32" height="52" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5"/>
                    <line x1="6" y1="14" x2="26" y2="14" stroke="currentColor" strokeWidth="2"/>
                    <line x1="6" y1="26" x2="26" y2="26" stroke="currentColor" strokeWidth="2"/>
                    <line x1="6" y1="38" x2="26" y2="38" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="9" cy="14" r="1.5" fill="currentColor"/>
                    <circle cx="9" cy="26" r="1.5" fill="currentColor"/>
                    <circle cx="9" cy="38" r="1.5" fill="currentColor"/>
                  </g>

                  {/* Channel connecting both — multiple lines for "encrypted" feel */}
                  <line x1="46" y1="56" x2="154" y2="56" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5"/>
                  <line x1="46" y1="64" x2="154" y2="64" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5"/>

                  {/* Lock badge centered on channel */}
                  <g transform="translate(80, 44)">
                    <rect x="0" y="0" width="40" height="32" rx="6" fill="var(--panel)" stroke="currentColor" strokeWidth="2"/>
                    <path d="M 14 14 V 11 a 6 6 0 0 1 12 0 V 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <rect x="11" y="14" width="18" height="13" rx="2" fill="currentColor"/>
                    <circle cx="20" cy="20" r="1.5" fill="var(--panel)"/>
                    <line x1="20" y1="20" x2="20" y2="24" stroke="var(--panel)" strokeWidth="1.5"/>
                  </g>

                  {/* Animated encrypted bits flowing */}
                  <g className="sec-tart-bits">
                    <text x="60" y="20" fontFamily="JetBrains Mono" fontSize="8" fill="currentColor" opacity="0.55">01101010</text>
                    <text x="120" y="20" fontFamily="JetBrains Mono" fontSize="8" fill="currentColor" opacity="0.4">11001011</text>
                    <text x="60" y="106" fontFamily="JetBrains Mono" fontSize="8" fill="currentColor" opacity="0.4">10110100</text>
                    <text x="120" y="106" fontFamily="JetBrains Mono" fontSize="8" fill="currentColor" opacity="0.55">01011001</text>
                  </g>
                </g>
              </svg>
            </div>

            <h3 className="sec-tcard-name">Uçtan uca şifreli</h3>
            <p className="sec-tcard-desc">Veri yüzükten panele kadar şifrelenmiş kanaldan akar; hem aktarımda hem depoda standart endüstri kriptografisi uygulanır.</p>

            <div className="sec-tcard-pill mono">
              <span className="sec-pill-dot" aria-hidden="true"/>
              TLS · AES · TRANSIT + REST
            </div>
          </article>

          {/* Card 3 — Instant Revoke */}
          <article className="sec-tcard sec-tcard--green">
            <span className="sec-tcard-grain" aria-hidden="true"/>
            <span className="sec-tcard-aura" aria-hidden="true"/>
            <span className="sec-tcard-scan" aria-hidden="true"/>

            <header className="sec-tcard-rail">
              <span className="mono sec-stage">A3</span>
              <span className="sec-stage-rule" aria-hidden="true"/>
              <span className="mono sec-stage-label">KONTROL</span>
            </header>

            <div className="sec-tcard-art" aria-hidden="true">
              <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet" className="sec-tart">
                {/* Toggle switch — animated between ON / OFF states */}
                <g className="sec-tart-toggle">
                  {/* Label rail */}
                  <text x="40" y="38" fontFamily="JetBrains Mono" fontSize="11" fill="currentColor"
                        opacity="0.45" letterSpacing="0.16em" fontWeight="700">OFF</text>
                  <text x="120" y="38" fontFamily="JetBrains Mono" fontSize="11" fill="currentColor"
                        letterSpacing="0.16em" fontWeight="700">AKTİF</text>

                  {/* Toggle track */}
                  <rect x="40" y="50" width="120" height="36" rx="18" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.6"/>
                  <rect x="44" y="54" width="112" height="28" rx="14" fill="currentColor" opacity="0.12"/>

                  {/* Toggle knob — animated sliding */}
                  <circle className="sec-tart-knob" cx="140" cy="68" r="14" fill="currentColor"/>
                  <circle className="sec-tart-knob-inner" cx="140" cy="68" r="6" fill="var(--panel)"/>

                  {/* Tap indicator finger */}
                  <g className="sec-tart-tap" transform="translate(118, 92)">
                    <circle cx="14" cy="14" r="14" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" opacity="0.5"/>
                    <circle cx="14" cy="14" r="6" fill="currentColor"/>
                  </g>
                </g>
              </svg>
            </div>

            <h3 className="sec-tcard-name">Anında iptal</h3>
            <p className="sec-tcard-desc">Hasta uygulamadan tek dokunuşla doktor erişimini durdurabilir; iptal anında etkili olur, geçmiş veri akışı kapanır.</p>

            <div className="sec-tcard-pill mono">
              <span className="sec-pill-dot" aria-hidden="true"/>
              HASTA KONTROLÜ · ANINDA
            </div>
          </article>
        </div>
      </section>

      {/* ===== VI. NASIL ÇALIŞIR — Process flow with connecting glowing rail ===== */}
      <section className="landing-howitworks hiw-radical">
        <div className="section-head narrow">
          <span className="section-eye">VI. NASIL ÇALIŞIR</span>
          <h2 className="section-h">Hasta ile doktor arasında <em>üç adım</em>.</h2>
          <p className="section-sub">Yüzüğü tak, uygulamayı kur, panelde QR ile eşleş — üç durakla biten doğrusal bir akış.</p>
        </div>
        <ol className="hiw-rgrid">
          {/* Connecting rail — glowing line behind all steps */}
          <span className="hiw-rgrid-rail" aria-hidden="true">
            <span className="hiw-rgrid-rail-fill"/>
            <span className="hiw-rgrid-packet hiw-rgrid-packet--1"/>
            <span className="hiw-rgrid-packet hiw-rgrid-packet--2"/>
            <span className="hiw-rgrid-packet hiw-rgrid-packet--3"/>
          </span>

          {/* Step 1 — Wear ring + open app */}
          <li className="hiw-rstep hiw-rstep--red">
            <div className="hiw-rstep-num">
              <span className="mono hiw-rstep-num-prefix">STEP</span>
              <span className="hiw-rstep-num-big mono">01</span>
            </div>
            <div className="hiw-rstep-art" aria-hidden="true">
              <svg viewBox="0 0 220 120" preserveAspectRatio="xMidYMid meet" className="hiw-rart">
                {/* Ring outline with BLE wave */}
                <g transform="translate(110, 60)">
                  <ellipse cx="0" cy="0" rx="34" ry="26" fill="none" stroke="currentColor" strokeWidth="3"/>
                  <ellipse cx="0" cy="0" rx="22" ry="16" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
                  {/* Inner sensor dot */}
                  <circle cx="0" cy="14" r="4" fill="currentColor"/>
                  <circle cx="0" cy="14" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5">
                    <animate attributeName="r" values="4;14;4" dur="2.4s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite"/>
                  </circle>
                </g>
                {/* BLE waves emanating from right */}
                {[0, 1, 2].map((i) => (
                  <path key={i}
                        d={`M ${158 + i * 12} 50 Q ${168 + i * 12} 60 ${158 + i * 12} 70`}
                        fill="none" stroke="currentColor" strokeWidth="2"
                        opacity={0.7 - i * 0.2} strokeLinecap="round"/>
                ))}
                {/* "BLE" tag */}
                <text x="200" y="64" fontFamily="JetBrains Mono" fontSize="9" fill="currentColor"
                      fontWeight="700" letterSpacing="0.16em" textAnchor="end" opacity="0.7">BLE</text>
              </svg>
            </div>
            <h4 className="hiw-rstep-name">Yüzüğü tak, uygulamayı aç</h4>
            <p className="hiw-rstep-desc">Mobil uygulama yüzüğü otomatik bulur, BLE 5.0 üzerinden tek dokunuşla eşleşir. Kalibrasyon gerekmez.</p>
          </li>

          {/* Step 2 — Scan QR */}
          <li className="hiw-rstep hiw-rstep--blue">
            <div className="hiw-rstep-num">
              <span className="mono hiw-rstep-num-prefix">STEP</span>
              <span className="hiw-rstep-num-big mono">02</span>
            </div>
            <div className="hiw-rstep-art" aria-hidden="true">
              <svg viewBox="0 0 220 120" preserveAspectRatio="xMidYMid meet" className="hiw-rart">
                {/* Phone with QR scan beam */}
                <g transform="translate(80, 14)">
                  <rect x="0" y="0" width="60" height="92" rx="8" fill="none" stroke="currentColor" strokeWidth="2.5"/>
                  <rect x="6" y="10" width="48" height="68" rx="3" fill="currentColor" opacity="0.10"/>
                  {/* QR mini inside */}
                  <g transform="translate(18, 22)">
                    <rect x="0" y="0" width="9" height="9" fill="currentColor"/>
                    <rect x="15" y="0" width="9" height="9" fill="currentColor"/>
                    <rect x="0" y="15" width="9" height="9" fill="currentColor"/>
                    <rect x="18" y="18" width="6" height="6" fill="currentColor" opacity="0.6"/>
                    <rect x="9" y="9" width="3" height="3" fill="currentColor" opacity="0.55"/>
                    <rect x="6" y="21" width="3" height="3" fill="currentColor" opacity="0.7"/>
                    <rect x="21" y="9" width="3" height="3" fill="currentColor" opacity="0.55"/>
                  </g>
                  {/* Speaker grill at top */}
                  <line x1="22" y1="5" x2="38" y2="5" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
                  <circle cx="48" cy="5" r="1.5" fill="currentColor" opacity="0.5"/>
                </g>
                {/* Animated scan beam crossing horizontally over phone */}
                <line className="hiw-rart-beam" x1="86" y1="40" x2="134" y2="40"
                      stroke="currentColor" strokeWidth="2" opacity="0.8"/>
                {/* Corner brackets */}
                {[
                  { x: 18, y: 32, dx: 1, dy: 1 },
                  { x: 202, y: 32, dx: -1, dy: 1 },
                  { x: 18, y: 88, dx: 1, dy: -1 },
                  { x: 202, y: 88, dx: -1, dy: -1 },
                ].map((c, i) => (
                  <path key={i}
                        d={`M ${c.x} ${c.y + c.dy * 14} L ${c.x} ${c.y} L ${c.x + c.dx * 14} ${c.y}`}
                        fill="none" stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" opacity="0.55"/>
                ))}
              </svg>
            </div>
            <h4 className="hiw-rstep-name">Doktor panelinden QR'ı tara</h4>
            <p className="hiw-rstep-desc">Hasta, uygulamadaki tarayıcı ile panel QR'ını okur ve paylaşımı tek dokunuşla onaylar.</p>
          </li>

          {/* Step 3 — Live data on panel */}
          <li className="hiw-rstep hiw-rstep--green">
            <div className="hiw-rstep-num">
              <span className="mono hiw-rstep-num-prefix">STEP</span>
              <span className="hiw-rstep-num-big mono">03</span>
            </div>
            <div className="hiw-rstep-art" aria-hidden="true">
              <svg viewBox="0 0 220 120" preserveAspectRatio="xMidYMid meet" className="hiw-rart">
                {/* Dashboard panel with live chart */}
                <g transform="translate(20, 14)">
                  <rect x="0" y="0" width="180" height="92" rx="8" fill="none" stroke="currentColor" strokeWidth="2.5"/>
                  {/* Top bar */}
                  <rect x="0" y="0" width="180" height="14" rx="8" fill="currentColor" opacity="0.20"/>
                  <circle cx="8" cy="7" r="2" fill="currentColor"/>
                  <circle cx="16" cy="7" r="2" fill="currentColor" opacity="0.55"/>
                  <circle cx="24" cy="7" r="2" fill="currentColor" opacity="0.4"/>
                  {/* Chart */}
                  <g transform="translate(10, 24)">
                    {/* Grid */}
                    <line x1="0" y1="20" x2="160" y2="20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.3"/>
                    <line x1="0" y1="44" x2="160" y2="44" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.3"/>
                    {/* Live curve */}
                    <path d="M 0 38 C 18 32 36 36 54 28 C 72 18 96 14 116 24 C 136 34 152 22 160 18"
                          fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
                    {/* Pulse dot at end */}
                    <circle cx="160" cy="18" r="3" fill="currentColor"/>
                    <circle cx="160" cy="18" r="8" fill="currentColor" opacity="0.4">
                      <animate attributeName="r" values="3;12;3" dur="1.8s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.5;0;0.5" dur="1.8s" repeatCount="indefinite"/>
                    </circle>
                  </g>
                  {/* Bottom mini-stats */}
                  <g transform="translate(10, 76)">
                    <rect x="0" y="0" width="48" height="10" rx="2" fill="currentColor" opacity="0.18"/>
                    <rect x="56" y="0" width="48" height="10" rx="2" fill="currentColor" opacity="0.18"/>
                    <rect x="112" y="0" width="48" height="10" rx="2" fill="currentColor" opacity="0.30"/>
                  </g>
                </g>
              </svg>
            </div>
            <h4 className="hiw-rstep-name">Veri klinik panelde canlı</h4>
            <p className="hiw-rstep-desc">Şifreli kanaldan gelen fizyolojik akış doktor paneline gerçek zamanlı işlenir. 5/15/30 dk tahminleri otomatik üretilir.</p>
          </li>
        </ol>
      </section>

      {/* ===== VII. KLİNİSYEN İÇİN — Telemetry-style value cards ===== */}
      <section className="landing-value bg-panel">
        <div className="section-head narrow">
          <span className="section-eye">VII. KLİNİSYEN İÇİN</span>
          <h2 className="section-h">Klinik karar desteği, <em>tek panelde</em>.</h2>
          <p className="section-sub">Hasta listesi, fizyolojik trendler ve glukoz risk olayları — hekimin tek bir okunabilir arayüzde toplanır.</p>
        </div>
        <div className="value-tgrid">
          {/* Card 1 — 9 Parameter Monitoring */}
          <article className="value-tcard value-tcard--red">
            <span className="value-tcard-grain" aria-hidden="true"/>
            <span className="value-tcard-aura" aria-hidden="true"/>
            <span className="value-tcard-scan" aria-hidden="true"/>

            <header className="value-tcard-rail">
              <span className="mono value-stage">V1</span>
              <span className="value-stage-rule" aria-hidden="true"/>
              <span className="mono value-stage-label">SÜREKLİ İZLEM</span>
            </header>

            <div className="value-tcard-hero">
              <span className="value-hero-num mono">9</span>
              <span className="value-hero-unit mono">PARAMETRE</span>
            </div>

            <h3 className="value-tcard-name">Tüm fizyolojik akış, tek panelde</h3>
            <p className="value-tcard-desc">Yüzükten gelen 9 parametre hasta bazında 24 saatlik trend grafikleriyle özetlenir. Ölçüm aralıklarına manuel müdahale gerekmez.</p>

            <div className="value-tcard-art" aria-hidden="true">
              <svg viewBox="0 0 280 80" preserveAspectRatio="none" className="value-tart">
                {/* 9 mini parameter sparklines stacked */}
                {[
                  'M 4,8 L 30,6 L 56,10 L 82,5 L 108,8 L 134,4 L 160,7 L 186,6 L 212,9 L 238,5 L 264,7',
                  'M 4,16 L 30,14 L 56,17 L 82,12 L 108,18 L 134,13 L 160,15 L 186,17 L 212,12 L 238,16 L 264,14',
                  'M 4,24 L 30,26 L 56,21 L 82,28 L 108,24 L 134,28 L 160,22 L 186,25 L 212,28 L 238,24 L 264,26',
                  'M 4,33 L 30,30 L 56,36 L 82,32 L 108,30 L 134,34 L 160,33 L 186,30 L 212,35 L 238,32 L 264,34',
                  'M 4,42 L 30,44 L 56,40 L 82,46 L 108,42 L 134,40 L 160,45 L 186,41 L 212,44 L 238,46 L 264,42',
                  'M 4,51 L 30,49 L 56,52 L 82,48 L 108,53 L 134,49 L 160,52 L 186,50 L 212,55 L 238,49 L 264,53',
                  'M 4,60 L 30,62 L 56,58 L 82,63 L 108,59 L 134,61 L 160,57 L 186,62 L 212,60 L 238,58 L 264,61',
                  'M 4,69 L 30,67 L 56,72 L 82,68 L 108,70 L 134,67 L 160,71 L 186,68 L 212,66 L 238,70 L 264,68',
                  'M 4,77 L 30,76 L 56,73 L 82,79 L 108,75 L 134,77 L 160,73 L 186,76 L 212,74 L 238,78 L 264,75',
                ].map((d, i) => (
                  <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="1.25"
                        strokeLinecap="round" opacity={0.4 + (i % 3) * 0.18}/>
                ))}
              </svg>
            </div>
          </article>

          {/* Card 2 — Early Warning */}
          <article className="value-tcard value-tcard--blue">
            <span className="value-tcard-grain" aria-hidden="true"/>
            <span className="value-tcard-aura" aria-hidden="true"/>
            <span className="value-tcard-scan" aria-hidden="true"/>

            <header className="value-tcard-rail">
              <span className="mono value-stage">V2</span>
              <span className="value-stage-rule" aria-hidden="true"/>
              <span className="mono value-stage-label">ERKEN UYARI</span>
            </header>

            <div className="value-tcard-hero">
              <span className="value-hero-num mono">30</span>
              <span className="value-hero-unit mono">DAKİKA</span>
            </div>

            <h3 className="value-tcard-name">Risk pencereleri, eylem öncesinde</h3>
            <p className="value-tcard-desc">5/15/30 dakika öncesinden öngörülen düşük/yüksek glukoz olayları panele sıralı bildirim olarak düşer — sayısal eşiklerle eyleme dönük.</p>

            <div className="value-tcard-art" aria-hidden="true">
              <svg viewBox="0 0 280 80" preserveAspectRatio="none" className="value-tart">
                {/* Horizontal timeline with 3 alert markers at 5/15/30 */}
                <line x1="12" y1="40" x2="268" y2="40" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
                {/* Threshold lines */}
                <line x1="12" x2="268" y1="18" y2="18" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" opacity="0.4"/>
                <line x1="12" x2="268" y1="62" y2="62" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" opacity="0.4"/>

                {/* Alert markers */}
                {[{ x: 64, lbl: '+5DK', y: 26 }, { x: 140, lbl: '+15DK', y: 22 }, { x: 232, lbl: '+30DK', y: 12 }].map((a, i) => (
                  <g key={i}>
                    <line x1={a.x} x2={a.x} y1={a.y} y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
                    <circle cx={a.x} cy={a.y} r="4" fill="currentColor"/>
                    <circle cx={a.x} cy={a.y} r="9" fill="currentColor" opacity="0.32">
                      <animate attributeName="r" values="4;14;4" dur="2s" begin={`${i * 0.5}s`} repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" begin={`${i * 0.5}s`} repeatCount="indefinite"/>
                    </circle>
                    <text x={a.x} y="56" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9"
                          fontWeight="700" letterSpacing="0.06em" fill="currentColor" opacity="0.7">{a.lbl}</text>
                  </g>
                ))}

                {/* Bell pictograph at end */}
                <g transform="translate(252, 64)">
                  <path d="M 4 8 V 4 a 4 4 0 0 1 8 0 V 8 a 6 6 0 0 0 1 4 H 3 a 6 6 0 0 0 1 -4 Z"
                        fill="currentColor" opacity="0.85"/>
                  <line x1="6" y1="14" x2="10" y2="14" stroke="currentColor" strokeWidth="1.5"/>
                </g>
              </svg>
            </div>
          </article>

          {/* Card 3 — Reporting */}
          <article className="value-tcard value-tcard--green">
            <span className="value-tcard-grain" aria-hidden="true"/>
            <span className="value-tcard-aura" aria-hidden="true"/>
            <span className="value-tcard-scan" aria-hidden="true"/>

            <header className="value-tcard-rail">
              <span className="mono value-stage">V3</span>
              <span className="value-stage-rule" aria-hidden="true"/>
              <span className="mono value-stage-label">RAPORLAMA</span>
            </header>

            <div className="value-tcard-hero">
              <span className="value-hero-num mono">PDF</span>
              <span className="value-hero-unit mono">RAPOR</span>
            </div>

            <h3 className="value-tcard-name">Haftalık & aylık özet çıktısı</h3>
            <p className="value-tcard-desc">Hasta bazlı haftalık ve aylık rapor — muayene öncesi tek bakışta seyir özeti, klinik karar için hazır format.</p>

            <div className="value-tcard-art" aria-hidden="true">
              <svg viewBox="0 0 280 80" preserveAspectRatio="none" className="value-tart">
                {/* Document outline with chart inside + corner fold */}
                <g transform="translate(60, 6)">
                  <path d="M 0 0 H 130 L 152 22 V 68 H 0 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
                  {/* Folded corner */}
                  <path d="M 130 0 V 22 H 152" fill="none" stroke="currentColor" strokeWidth="2"/>
                  {/* PDF tag */}
                  <rect x="8" y="6" width="22" height="11" rx="2" fill="currentColor"/>
                  <text x="19" y="14.5" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8"
                        fontWeight="700" fill="var(--panel)">PDF</text>
                  {/* Chart inside */}
                  <g transform="translate(12, 28)">
                    <line x1="0" y1="32" x2="128" y2="32" stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
                    <path d="M 0 26 C 16 22 32 28 48 18 C 64 12 80 22 96 14 C 108 8 120 18 128 10"
                          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M 0 26 C 16 22 32 28 48 18 C 64 12 80 22 96 14 C 108 8 120 18 128 10 L 128 32 L 0 32 Z"
                          fill="currentColor" opacity="0.18"/>
                  </g>
                </g>
              </svg>
            </div>
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
