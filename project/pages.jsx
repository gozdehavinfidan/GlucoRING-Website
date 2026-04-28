// Pages: Dashboard, Patients, PatientDetail, Alerts, Reports, Notes, Settings

// Patient identifier: last 6 chars of UID, uppercase (e.g. "PT-FZQUD3")
const formatPatientId = (uid) => {
  if (!uid) return 'PT-XXXX';
  return 'PT-' + uid.slice(-6).toUpperCase();
};

const formatRelativeTime = (ms) => {
  if (!ms) return '—';
  const diff = Date.now() - Number(ms);
  if (diff < 0) return 'şimdi';
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'şimdi';
  if (min < 60) return `${min} dk önce`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} sa önce`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} gün önce`;
  if (d < 30) return `${Math.floor(d / 7)} hafta önce`;
  return `${Math.floor(d / 30)} ay önce`;
};

// Decorative inline SVG graphics for the dashboard bento cards.
const DashGfxPatients = () => (
  <svg className="db-gfx" viewBox="0 0 160 60" preserveAspectRatio="none" aria-hidden="true">
    <circle cx="28" cy="32" r="14" fill="currentColor" opacity="0.32"/>
    <circle cx="58" cy="28" r="18" fill="currentColor" opacity="0.55"/>
    <circle cx="92" cy="32" r="14" fill="currentColor" opacity="0.32"/>
    <circle cx="122" cy="36" r="10" fill="currentColor" opacity="0.18"/>
    <circle cx="146" cy="40" r="6" fill="currentColor" opacity="0.10"/>
  </svg>
);

const DashGfxHypo = () => (
  <svg className="db-gfx" viewBox="0 0 160 60" preserveAspectRatio="none" aria-hidden="true">
    <line x1="0" y1="22" x2="160" y2="22" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity="0.4"/>
    <text x="156" y="18" fontSize="9" fill="currentColor" opacity="0.6" textAnchor="end" fontFamily="JetBrains Mono">70</text>
    <polyline points="0,18 22,22 44,28 66,30 88,38 110,46 132,52 160,56" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="160" cy="56" r="3.5" fill="currentColor"/>
  </svg>
);

const DashGfxHyper = () => (
  <svg className="db-gfx" viewBox="0 0 160 60" preserveAspectRatio="none" aria-hidden="true">
    <line x1="0" y1="38" x2="160" y2="38" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity="0.4"/>
    <text x="156" y="50" fontSize="9" fill="currentColor" opacity="0.6" textAnchor="end" fontFamily="JetBrains Mono">180</text>
    <polyline points="0,42 22,38 44,32 66,30 88,22 110,14 132,8 160,4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="160" cy="4" r="3.5" fill="currentColor"/>
  </svg>
);

const DashGfxSync = () => (
  <svg className="db-gfx" viewBox="0 0 160 60" preserveAspectRatio="none" aria-hidden="true">
    <polyline
      points="0,30 18,30 26,16 36,44 46,22 58,38 70,30 160,30"
      fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
    />
    <circle cx="70" cy="30" r="4" fill="currentColor">
      <animate attributeName="r" values="4;7;4" dur="1.4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="1;0.4;1" dur="1.4s" repeatCount="indefinite"/>
    </circle>
  </svg>
);

// EKG-style heart rate trace
const DashGfxEKG = () => (
  <svg className="db-gfx" viewBox="0 0 160 60" preserveAspectRatio="none" aria-hidden="true">
    <polyline
      points="0,30 30,30 38,30 42,18 48,42 54,12 60,30 90,30 98,18 104,42 110,12 116,30 160,30"
      fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

// Circular ring meter for SpO2 (value 0-100 → arc fill)
const DashGfxRing = ({ value }) => {
  const v = value != null ? Math.max(0, Math.min(100, Number(value))) : 0;
  const r = 24;
  const c = 2 * Math.PI * r;
  const filled = c * (v / 100);
  return (
    <svg className="db-gfx" viewBox="0 0 60 60" aria-hidden="true">
      <circle cx="30" cy="30" r={r} fill="none" stroke="currentColor" strokeWidth="4" opacity="0.18"/>
      <circle cx="30" cy="30" r={r} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
        strokeDasharray={`${filled} ${c - filled}`} strokeDashoffset={c / 4} transform="rotate(-90 30 30)"/>
    </svg>
  );
};

// Vertical thermometer with current value mark
const DashGfxThermo = ({ value }) => {
  const v = value != null ? Math.max(34, Math.min(40, Number(value))) : 36.5;
  const pct = (v - 34) / 6; // 34..40 → 0..1
  const fillH = 30 * pct;
  return (
    <svg className="db-gfx" viewBox="0 0 160 60" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <rect x="60" y="6" width="40" height="36" rx="6" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35"/>
      <rect x="60" y={6 + (30 - fillH)} width="40" height={fillH + 6} rx="4" fill="currentColor" opacity="0.85"/>
      <circle cx="80" cy="48" r="9" fill="currentColor"/>
    </svg>
  );
};

// HRV bars
const DashGfxHRV = () => (
  <svg className="db-gfx" viewBox="0 0 160 60" preserveAspectRatio="none" aria-hidden="true">
    {[14, 22, 18, 28, 32, 24, 36, 30, 40, 26, 34, 38, 30, 24, 32, 28, 22, 30].map((h, i) => (
      <rect key={i} x={i * 9 + 4} y={50 - h} width="5" height={h} rx="2" fill="currentColor" opacity={0.4 + (i % 3) * 0.18}/>
    ))}
  </svg>
);

const DashGfx = ({ kind, value }) => {
  if (kind === 'patients') return <DashGfxPatients/>;
  if (kind === 'hypo')     return <DashGfxHypo/>;
  if (kind === 'hyper')    return <DashGfxHyper/>;
  if (kind === 'sync')     return <DashGfxSync/>;
  if (kind === 'ekg')      return <DashGfxEKG/>;
  if (kind === 'ring')     return <DashGfxRing value={value}/>;
  if (kind === 'thermo')   return <DashGfxThermo value={value}/>;
  if (kind === 'hrv')      return <DashGfxHRV/>;
  return null;
};

// Dashboard bento card following the landing /params hero/card pattern.
const DashCard = ({ index, name, value, unit, hint, tone, gfx, gfxValue }) => {
  const isText = typeof value === 'string' && !/^[\d\.\-,]+$/.test(value);
  return (
    <div className={`pb-card db-card ${tone ? 'db-card--' + tone : ''}`}>
      <div className="pb-card-head">
        <span className="pb-num mono">{index}</span>
        <span className="pb-name">{name}</span>
      </div>
      {gfx && <div className="db-gfx-wrap"><DashGfx kind={gfx} value={gfxValue}/></div>}
      <div className={`pb-big db-big ${isText ? 'is-text' : ''}`}>
        <span className="num mono">{value != null && value !== '' ? value : '—'}</span>
        {unit && value != null && !isText ? <span className="u">{unit}</span> : null}
      </div>
      {hint && <div className="db-hint" dangerouslySetInnerHTML={{ __html: hint }}/>}
    </div>
  );
};

const HYPO_THRESHOLD = 70;
const HYPER_THRESHOLD = 180;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const Dashboard = ({ tw, onSelect, onNav }) => {
  const auth = (typeof useFirebaseAuth === 'function')
    ? useFirebaseAuth()
    : { user: null, profile: null, ready: true };

  const [links, setLinks] = React.useState([]);
  const [linksLoading, setLinksLoading] = React.useState(true);
  // Map<patientUid, { latest, last24h }>
  const [readings, setReadings] = React.useState({});

  // Subscribe to linked devices.
  React.useEffect(() => {
    if (!auth.user || !window.fbDb) {
      setLinksLoading(false);
      return;
    }
    const unsub = window.fbDb.collection('linkedDevices')
      .where('doctorUid', '==', auth.user.uid)
      .where('status', '==', 'active')
      .onSnapshot((snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (b.linkedAt || 0) - (a.linkedAt || 0));
        setLinks(docs);
        setLinksLoading(false);
      }, (err) => {
        console.error('[dashboard] linkedDevices query failed:', err);
        setLinksLoading(false);
      });
    return unsub;
  }, [auth.user && auth.user.uid]);

  // For each linked patient, subscribe to recent healthMetrics. Cap at 12 patients.
  // We pull the last 120 docs and filter the 24h window client-side so a slightly
  // skewed device clock doesn't hide perfectly fresh data.
  React.useEffect(() => {
    if (!window.fbDb || !links.length) {
      setReadings({});
      return;
    }
    const unsubs = [];
    const visiblePatients = links.slice(0, 12).map((l) => l.patientUid).filter(Boolean);
    visiblePatients.forEach((uid) => {
      const unsub = window.fbDb
        .collection('patients').doc(uid)
        .collection('healthMetrics')
        .orderBy('timestamp', 'desc')
        .limit(120)
        .onSnapshot((snap) => {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          const sinceMs = Date.now() - ONE_DAY_MS;
          const last24h = docs.filter((d) => (d.timestamp || 0) >= sinceMs);
          setReadings((prev) => ({
            ...prev,
            [uid]: { latest: docs[0] || null, last24h },
          }));
        }, (err) => {
          console.error('[dashboard] healthMetrics subscribe failed for', uid, err);
        });
      unsubs.push(unsub);
    });
    return () => { unsubs.forEach((u) => { try { u(); } catch (_) {} }); };
  }, [links.map((l) => l.patientUid).join('|')]);

  const doctorName = (auth.profile && auth.profile.displayName)
    || (auth.user && auth.user.displayName)
    || (auth.user && auth.user.email && auth.user.email.split('@')[0])
    || 'Hekim';
  const greeting = `Dr. ${doctorName}`;

  // Aggregates
  const activeCount = links.length;
  const allReadings = Object.values(readings).flatMap((r) => r.last24h || []);
  const hypoEvents = allReadings.filter((r) => r.bloodGlucose != null && r.bloodGlucose < HYPO_THRESHOLD);
  const hyperEvents = allReadings.filter((r) => r.bloodGlucose != null && r.bloodGlucose > HYPER_THRESHOLD);
  const hypoPatients = new Set(hypoEvents.map((r) => r.patientUid || r._uid)).size; // best-effort
  const lastSyncMs = allReadings.reduce((max, r) => Math.max(max, r.timestamp || 0), 0);
  const lastSyncLabel = lastSyncMs ? formatRelativeTime(lastSyncMs) : (linksLoading ? 'yükleniyor…' : 'veri yok');

  // Live feed: every linked patient's latest reading, newest first
  const feed = links
    .map((l) => ({ link: l, latest: readings[l.patientUid] && readings[l.patientUid].latest }))
    .filter((x) => x.latest)
    .sort((a, b) => (b.latest.timestamp || 0) - (a.latest.timestamp || 0));

  const goToPatient = (uid) => {
    if (onSelect) onSelect(uid);
  };
  const goToPatients = () => { if (onNav) onNav('patients'); };
  const goToPairing = () => { if (onNav) onNav('pairing'); };

  return (
    <div className={`dash-layout-${tw.layout || 'comfortable'}`}>
      <div className="page-h">
        <div>
          <h1>{greeting}</h1>
          <p className="lede">{activeCount > 0
            ? `${activeCount} aktif hasta · son 24 saatte ${allReadings.length} okuma`
            : 'Aktif hasta yok'}</p>
        </div>
        <div className="row gap-12">
          <button className="btn-pill ghost" style={{ padding: '10px 16px' }} onClick={goToPatients}>
            <I name="users" size={14}/> Hastalar
          </button>
          <button className="btn-pill btn-accent" style={{ padding: '10px 16px' }} onClick={goToPairing}>
            <I name="plus" size={14}/> Eşleştir
          </button>
        </div>
      </div>

      <div className="dash-bento">
        {/* HERO — son okuma */}
        {(() => {
          const newest = feed[0];
          if (newest && newest.latest) {
            const g = newest.latest.bloodGlucose;
            const status = g == null ? 'gray' : g < HYPO_THRESHOLD ? 'warn' : g > HYPER_THRESHOLD ? 'crit' : 'ok';
            const statusLabel = g == null ? '—' : g < HYPO_THRESHOLD ? 'Hipoglisemi' : g > HYPER_THRESHOLD ? 'Hiperglisemi' : 'Hedef aralıkta';
            const trendArrow = g == null ? '·' : g < HYPO_THRESHOLD ? '↓' : g > HYPER_THRESHOLD ? '↑' : '→';
            return (
              <div className={`pb-card pb-hero db-hero db-hero--${status}`}>
                <div className="pb-live"><span className="pb-dot"/>CANLI</div>
                <div className="pb-hero-top">
                  <span className="pb-eyebrow mono">SON OKUMA · {newest.link.patientName || formatPatientId(newest.link.patientUid)}</span>
                  <h3>Güncel glukoz<br/>{formatRelativeTime(newest.latest.timestamp)}</h3>
                  <p>{statusLabel} · Kaynak {newest.latest.dataSource || 'RING'}</p>
                </div>
                <div className="pb-hero-readout">
                  <div className="pb-hero-val">
                    <span className="num mono">{g != null ? g : '—'}</span>
                    <span className="u">mg/dL</span>
                  </div>
                  <div className="pb-hero-trend">
                    <span className="trend-arrow">{trendArrow}</span>
                    <span className="trend-label">{statusLabel}</span>
                  </div>
                </div>
                <div className="pb-hero-axis mono">
                  <span>HR {newest.latest.heartRate != null ? Math.round(newest.latest.heartRate) : '—'}</span>
                  <span>SpO₂ {newest.latest.oxygenSaturation != null ? Math.round(newest.latest.oxygenSaturation) : '—'}%</span>
                  <span>{newest.latest.bodyTemperature != null ? Number(newest.latest.bodyTemperature).toFixed(1) : '—'}°C</span>
                  <span>HRV {newest.latest.hrvSdnn != null ? Math.round(newest.latest.hrvSdnn) : '—'}</span>
                </div>
              </div>
            );
          }
          return (
            <div className="pb-card pb-hero db-hero db-hero--gray">
              <div className="pb-hero-top">
                <span className="pb-eyebrow mono">PANEL</span>
                <h3>Aktif hasta yok</h3>
                <p>QR ile eşleştirin.</p>
              </div>
              <div className="pb-hero-readout">
                <div className="pb-hero-val">
                  <span className="num mono">{activeCount}</span>
                  <span className="u">hasta</span>
                </div>
              </div>
            </div>
          );
        })()}

        <DashCard
          index="01"
          name="Aktif Hasta"
          value={linksLoading ? '…' : activeCount}
          unit="hasta"
          tone="accent"
          gfx="patients"
          hint={activeCount > 0 ? 'canlı izlemede' : 'eşleşme yok'}
        />
        <DashCard
          index="02"
          name="Hipoglisemi"
          value={hypoEvents.length}
          unit="olay"
          tone={hypoEvents.length > 0 ? 'warn' : 'ok'}
          gfx="hypo"
          hint={`24 sa · &lt; ${HYPO_THRESHOLD} mg/dL`}
        />
        <DashCard
          index="03"
          name="Hiperglisemi"
          value={hyperEvents.length}
          unit="olay"
          tone={hyperEvents.length > 0 ? 'crit' : 'ok'}
          gfx="hyper"
          hint={`24 sa · &gt; ${HYPER_THRESHOLD} mg/dL`}
        />
        <DashCard
          index="04"
          name="Son Senkron"
          value={lastSyncLabel}
          tone="info"
          gfx="sync"
          hint={lastSyncMs ? new Date(lastSyncMs).toLocaleString('tr-TR') : 'akış başlamadı'}
        />
      </div>

      <div className="card mt-28">
        <div className="card-h">
          <h3>Hasta Akışı</h3>
          <div className="meta mono">canlı</div>
        </div>
        {linksLoading && (
          <div className="empty" style={{ padding: '48px 16px' }}>
            <div className="ico"><I name="sync"/></div>
            <h4>Yükleniyor</h4>
          </div>
        )}
        {!linksLoading && activeCount === 0 && (
          <div className="empty" style={{ padding: '56px 16px' }}>
            <div className="ico"><I name="users"/></div>
            <h4>Aktif eşleşme yok</h4>
            <div style={{ marginTop: 18 }}>
              <button className="btn-pill btn-accent" style={{ padding: '10px 18px' }} onClick={goToPairing}>
                <I name="plus" size={14}/> Hasta Eşleştir
              </button>
            </div>
          </div>
        )}
        {!linksLoading && activeCount > 0 && feed.length === 0 && (
          <div className="empty" style={{ padding: '48px 16px' }}>
            <div className="ico"><I name="pulse"/></div>
            <h4>Okuma yok</h4>
            <p>İlk veri geldiğinde burada görünür.</p>
          </div>
        )}
        {!linksLoading && feed.length > 0 && (
          <div className="patient-feed">
            {feed.map(({ link, latest }) => {
              const g = latest.bloodGlucose;
              const status = g == null ? 'gray' : g < HYPO_THRESHOLD ? 'warn' : g > HYPER_THRESHOLD ? 'crit' : 'ok';
              const statusLabel = g == null ? '—' : g < HYPO_THRESHOLD ? 'Hipo' : g > HYPER_THRESHOLD ? 'Hiper' : 'Normal';
              return (
                <button
                  key={link.id}
                  type="button"
                  className={`feed-row feed-${status}`}
                  onClick={() => goToPatient(link.patientUid)}
                >
                  <div className="feed-avatar">{(link.patientUid || '').slice(-2).toUpperCase() || '—'}</div>
                  <div className="feed-id">
                    <div className="feed-name">{link.patientName || formatPatientId(link.patientUid)}</div>
                    <div className="feed-sub mono">{formatRelativeTime(latest.timestamp)} · {latest.dataSource || 'RING'}</div>
                  </div>
                  <div className="feed-metric">
                    <div className="feed-metric-num mono">{g != null ? g : '—'}<span className="feed-metric-unit"> mg/dL</span></div>
                    <div className={`feed-pill feed-pill--${status}`}>{statusLabel}</div>
                  </div>
                  <div className="feed-vitals mono">
                    <span>HR {latest.heartRate != null ? Math.round(latest.heartRate) : '—'}</span>
                    <span>SpO₂ {latest.oxygenSaturation != null ? Math.round(latest.oxygenSaturation) : '—'}%</span>
                    <span>{latest.bodyTemperature != null ? Number(latest.bodyTemperature).toFixed(1) : '—'}°C</span>
                  </div>
                  <I name="chevR" size={16}/>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const Patients = ({ onOpen, onSelect }) => {
  const auth = (typeof useFirebaseAuth === 'function')
    ? useFirebaseAuth()
    : { user: null, profile: null, ready: true };
  const [filter, setFilter] = React.useState('all');
  const [links, setLinks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!auth.user || !window.fbDb) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const unsub = window.fbDb.collection('linkedDevices')
      .where('doctorUid', '==', auth.user.uid)
      .where('status', '==', 'active')
      .onSnapshot((snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (b.linkedAt || 0) - (a.linkedAt || 0));
        setLinks(docs);
        setLoading(false);
      }, (err) => {
        console.error('[patients] linkedDevices query failed:', err);
        setError('Hasta listesi yüklenemedi.');
        setLoading(false);
      });
    return unsub;
  }, [auth.user && auth.user.uid]);

  const hasPatients = links.length > 0;
  return (
    <>
      <div className="page-h">
        <div>
          <h1>Hastalar</h1>
          <p className="lede">Eşleştirilmiş hastalarınızın listesi. Risk seviyesine göre renk kodlu.</p>
        </div>
        <div className="row gap-12">
          <button className="btn-pill ghost" style={{ padding: '10px 16px' }}>
            <I name="download" size={14}/> Dışa Aktar
          </button>
          <button className="btn-pill btn-accent" style={{ padding: '10px 16px' }} onClick={() => onOpen('pairing')}>
            <I name="plus" size={14}/> Eşleştir
          </button>
        </div>
      </div>

      <div className="filter-bar">
        {[
          ['all', 'Tümü'], ['high', 'Yüksek Risk'], ['warn', 'Dikkat'], ['ok', 'Normal'],
          ['t1', 'Tip 1'], ['t2', 'Tip 2'], ['gest', 'Gestasyonel'],
        ].map(([k, l]) => (
          <span key={k} className={`chip ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>{l}</span>
        ))}
        <div style={{ flex: 1 }}/>
        <div className="search" style={{ width: 240, marginLeft: 0 }}>
          <I name="search" size={14}/>
          <input placeholder="Hasta adı veya ID"/>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 22 }}>Hasta</th>
              <th>Yaş</th>
              <th>Diyabet Tipi</th>
              <th>Aktif Sezon Modeli</th>
              <th>Son Senkron</th>
              <th>Risk</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="7" style={{ padding: 0 }}>
                <div className="empty" style={{ border: 'none', padding: '48px 24px' }}>
                  <div className="ico"><I name="users"/></div>
                  <h4>Yükleniyor…</h4>
                  <span className="hint mono">querying linkedDevices</span>
                </div>
              </td></tr>
            )}
            {!loading && error && (
              <tr><td colSpan="7" style={{ padding: 0 }}>
                <div className="empty" style={{ border: 'none', padding: '48px 24px' }}>
                  <div className="ico"><I name="bell"/></div>
                  <h4>{error}</h4>
                  <span className="hint mono">tekrar denemek için sayfayı yenileyin</span>
                </div>
              </td></tr>
            )}
            {!loading && !error && !hasPatients && (
              <tr><td colSpan="7" style={{ padding: 0 }}>
                <div className="empty" style={{ border: 'none', padding: '64px 24px' }}>
                  <div className="ico"><I name="users"/></div>
                  <h4>Hasta listesi boş</h4>
                  <p>Bir hastayı eşleştirmek için QR kod oluşturun. Hasta uygulamadan onayladıktan sonra burada görünecek.</p>
                  <span className="hint mono">/linkedDevices · status: active</span>
                  <div style={{ marginTop: 18 }}>
                    <button className="btn-pill btn-accent" style={{ padding: '10px 18px' }} onClick={(e) => { e.stopPropagation(); onOpen('pairing'); }}>
                      İlk Hastayı Eşleştir
                    </button>
                  </div>
                </div>
              </td></tr>
            )}
            {!loading && !error && hasPatients && links.map((link) => (
              <tr key={link.id} style={{ cursor: 'pointer' }} onClick={() => onSelect && onSelect(link.patientUid)}>
                <td style={{ paddingLeft: 22 }}>
                  <div className="row gap-12">
                    <div className="patient-avatar" style={{ width: 32, height: 32, fontSize: 14 }}>
                      {(link.patientUid || '').slice(-2).toUpperCase() || '—'}
                    </div>
                    <div>
                      <div className="name">{link.patientName || 'Hasta'}</div>
                      <div className="mono" style={{ fontSize: 12, color: 'var(--text-mute)', letterSpacing: '0.04em' }}>
                        {formatPatientId(link.patientUid)}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{link.patientAge || '—'}</td>
                <td>{link.diabetesType || '—'}</td>
                <td className="mono">{link.seasonModel || 'Kişiselleştirilmiş'}</td>
                <td className="mono">{formatRelativeTime(link.linkedAt)}</td>
                <td><span className="pill gray"><span className="pdot"/> aktif</span></td>
                <td><I name="chevR" size={14}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const PatientDetail = ({ patientUid, onBack, tw }) => {
  const [horizon, setHorizon] = React.useState('15');
  const [reading, setReading] = React.useState(null);
  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!patientUid || !window.fbDb) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = window.fbDb
      .collection('patients').doc(patientUid)
      .collection('healthMetrics')
      .orderBy('timestamp', 'desc')
      .limit(60)
      .onSnapshot((snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setHistory(docs);
        setReading(docs[0] || null);
        setLoading(false);
      }, (err) => {
        console.error('[detail] healthMetrics query failed:', err);
        setLoading(false);
      });
    return unsub;
  }, [patientUid]);

  const seasonInfo = {
    summer: { name: 'Yaz Modeli', icon: 'sun' },
    winter: { name: 'Kış Modeli', icon: 'snow' },
    personal: { name: 'Kişiselleştirilmiş', icon: 'spark' },
  }[tw.seasonModel || 'personal'];

  const fmt = (v, digits = 0) => v == null ? '—' : Number(v).toFixed(digits);
  const lastSync = reading ? formatRelativeTime(reading.timestamp) : '—';
  const patientLabel = patientUid ? formatPatientId(patientUid) : 'PT-XXXX';

  return (
    <>
      <div className="row gap-12 mb-20">
        <button className="btn-pill ghost" style={{ padding: '8px 14px', fontSize: 14 }} onClick={onBack}>
          ← Hasta Listesi
        </button>
        <div className="crumbs mono"><span>Hastalar</span> <span className="sep">/</span> <span className="now">{patientLabel}</span></div>
      </div>

      {(() => {
        const g = reading?.bloodGlucose;
        const status = !reading ? 'gray' : g == null ? 'gray' : g < HYPO_THRESHOLD ? 'warn' : g > HYPER_THRESHOLD ? 'crit' : 'ok';
        const statusLabel = !reading ? (loading ? 'yükleniyor…' : 'veri yok') : g == null ? 'glukoz okuması yok' : g < HYPO_THRESHOLD ? 'Hipoglisemi eşiğinde' : g > HYPER_THRESHOLD ? 'Hiperglisemi eşiğinde' : 'Hedef aralıkta';
        const trendArrow = g == null ? '·' : g < HYPO_THRESHOLD ? '↓' : g > HYPER_THRESHOLD ? '↑' : '→';
        return (
        <div className="patient-bento">
          <div className={`pb-card pb-hero db-hero db-hero--${status} pd-hero`}>
            <div className="pb-live"><span className="pb-dot"/>{reading ? 'CANLI' : 'BEKLENİYOR'}</div>
            <div className="pb-hero-top">
              <span className="pb-eyebrow mono">HASTA · {patientLabel}</span>
              <h3>Güncel glukoz<br/>{reading ? lastSync : '—'}.</h3>
              <p>{statusLabel}. {reading?.dataSource ? `Kaynak: ${reading.dataSource}.` : ''}</p>
            </div>
            <div className="pb-hero-readout">
              <div className="pb-hero-val">
                <span className="num mono">{g != null ? g : '—'}</span>
                <span className="u">mg/dL</span>
              </div>
              <div className="pb-hero-trend">
                <span className="trend-arrow">{trendArrow}</span>
                <span className="trend-label">{statusLabel}</span>
              </div>
            </div>
            <div className="pb-hero-axis mono">
              <span>Outlier: {reading ? (reading.isOutlier ? 'EVET' : 'HAYIR') : '—'}</span>
              <span>Adım: {fmt(reading?.stepCount)}</span>
              <span>Kalori: {fmt(reading?.caloriesBurned, 1)}</span>
              <span>Mesafe: {fmt(reading?.distance, 2)} km</span>
            </div>
          </div>

          <DashCard
            index="01"
            name="Kalp Atışı"
            value={reading?.heartRate != null ? Math.round(reading.heartRate) : null}
            unit="bpm"
            tone="crit"
            gfx="ekg"
            hint={reading ? 'yüzükten anlık' : '—'}
          />
          <DashCard
            index="02"
            name="SpO₂"
            value={reading?.oxygenSaturation != null ? Math.round(reading.oxygenSaturation) : null}
            unit="%"
            tone="info"
            gfx="ring"
            gfxValue={reading?.oxygenSaturation}
            hint={reading ? 'oksijen doygunluğu' : '—'}
          />
          <DashCard
            index="03"
            name="Vücut Sıc."
            value={reading?.bodyTemperature != null ? Number(reading.bodyTemperature).toFixed(1) : null}
            unit="°C"
            tone="warn"
            gfx="thermo"
            gfxValue={reading?.bodyTemperature}
            hint={reading ? 'cilt sıcaklığı' : '—'}
          />
          <DashCard
            index="04"
            name="HRV (SDNN)"
            value={reading?.hrvSdnn != null ? Math.round(reading.hrvSdnn) : null}
            unit="ms"
            tone="ok"
            gfx="hrv"
            hint={reading?.hrvStressLevel != null ? `stres skoru ${reading.hrvStressLevel}` : '—'}
          />
        </div>
        );
      })()}

      <div className="pd-toolbar">
        <div className="pd-id">
          <div className="pd-id-name">{patientLabel}</div>
          <div className="pd-id-uid mono">{patientUid || '—'}</div>
        </div>
        <div className="pd-toolbar-meta">
          <span className="pill gray"><span className="pdot"/> {reading ? 'aktif veri akışı' : (loading ? 'yükleniyor' : 'veri yok')}</span>
          <span className="pd-season"><span className="pd-season-lbl mono">SEZON</span> <span>{seasonInfo.name}</span></span>
        </div>
        <div className="row gap-12">
          <button className="icon-btn" title="Yenile"><I name="refresh" size={16}/></button>
          <button className="btn-pill btn-accent" style={{ padding: '10px 16px' }}>
            <I name="download" size={14}/> PDF Rapor
          </button>
        </div>
      </div>

      <div className="card mb-20">
        <div className="card-h">
          <h3>Glukoz Tahmini · Gerçek vs Öngörülen</h3>
          <div className="row gap-12">
            <div className="chart-controls">
              {['5', '15', '30'].map(h => (
                <button key={h} className={horizon === h ? 'active' : ''} onClick={() => setHorizon(h)}>+{h} dk</button>
              ))}
            </div>
            <div className="chart-controls">
              <button className="active">24sa</button>
              <button>7g</button>
              <button>30g</button>
            </div>
          </div>
        </div>
        <div className="chart-shell" style={{ height: 320 }}>
          <GlucoseChart style={tw.chartStyle || 'line'} height={320}/>
        </div>
        <div className="row gap-20 mt-12" style={{ fontSize: 13, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono' }}>
          <span><span style={{ color: '#e63946' }}>━━</span> Öngörülen · +{horizon} dk</span>
          <span><span style={{ color: 'rgba(255,255,255,0.4)' }}>┄┄</span> Gerçek glukoz</span>
          <span><span style={{ color: 'rgba(230,57,70,0.4)' }}>┈┈</span> Hipo (≤70) / Hiper (≥180) eşikleri</span>
        </div>
      </div>


      <div className="split-2">
        <div className="pd-panel pd-panel--alerts">
          <div className="pd-panel-h">
            <div>
              <h3>Risk & Uyarı Geçmişi</h3>
              <div className="pd-panel-sub">Hipoglisemi/hiperglisemi öngörü kayıtları</div>
            </div>
            <span className="pd-count mono">0</span>
          </div>
          <div className="pd-empty pd-empty--alerts">
            <svg viewBox="0 0 64 64" className="pd-empty-art" aria-hidden="true">
              <circle cx="32" cy="32" r="28" fill="currentColor" opacity="0.1"/>
              <path d="M22 32 L30 40 L44 26" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h4>Aktif uyarı yok</h4>
            <p>Glukoz hipo/hiperglisemi eşiklerini geçtiğinde burada otomatik kayıt oluşur.</p>
          </div>
        </div>

        <div className="pd-panel pd-panel--notes">
          <div className="pd-panel-h">
            <div>
              <h3>Klinik Notlar</h3>
              <div className="pd-panel-sub">Doktor takip notları</div>
            </div>
            <span className="pd-count mono">0</span>
          </div>
          <div className="pd-empty">
            <svg viewBox="0 0 64 64" className="pd-empty-art" aria-hidden="true">
              <rect x="14" y="14" width="36" height="44" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.5"/>
              <line x1="22" y1="26" x2="42" y2="26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="22" y1="34" x2="42" y2="34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="22" y1="42" x2="34" y2="42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <h4>Henüz not yok</h4>
            <p>Aşağıdan ekleyin. Tarih ve hekim adı ile kaydedilir.</p>
          </div>
          <div className="pd-note-editor">
            <textarea placeholder="Klinik takip notu ekleyin…"/>
            <div className="pd-note-actions">
              <span className="pd-note-meta mono">{new Date().toLocaleDateString('tr-TR')}</span>
              <button className="btn-pill btn-accent" style={{ padding: '8px 16px', fontSize: 14 }}>
                <I name="plus" size={14}/> Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Alerts = () => (
  <>
    <div className="page-h">
      <div>
        <h1>Risk ve Uyarı Sistemi</h1>
        <p className="lede">Yaklaşan hipoglisemi/hiperglisemi öngörüleri ve sistem olayları.</p>
      </div>
    </div>
    <div className="filter-bar">
      <span className="chip active">Tümü</span>
      <span className="chip">Kritik</span>
      <span className="chip">Uyarı</span>
      <span className="chip">Bilgi</span>
      <span className="chip">Sistem</span>
    </div>
    <div className="card">
      <div className="empty" style={{ padding: '72px 24px' }}>
        <div className="ico"><I name="bell"/></div>
        <h4>Aktif uyarı yok</h4>
        <p>Hasta verisi akmaya başladığında modelin ürettiği uyarılar burada listelenir.</p>
        <span className="hint mono">collection: /alerts · order: timestamp desc</span>
      </div>
    </div>
  </>
);

const Reports = () => (
  <>
    <div className="page-h">
      <div>
        <h1>Veri Geçmişi & Raporlama</h1>
        <p className="lede">Günlük, haftalık ve aylık veri görünümü. PDF dışa aktarımı ile.</p>
      </div>
      <button className="btn-pill btn-accent" style={{ padding: '10px 16px' }}>
        <I name="download" size={14}/> Yeni Rapor Oluştur
      </button>
    </div>
    <div className="filter-bar">
      <span className="chip">Günlük</span>
      <span className="chip active">Haftalık</span>
      <span className="chip">Aylık</span>
    </div>
    <div className="split-3">
      {[
        ['Glukoz Trend Özeti', 'chart'],
        ['Risk Olayları', 'bell'],
        ['Fizyoloji Değişimi', 'pulse'],
      ].map(([t, ic]) => (
        <div key={t} className="card">
          <div className="card-h">
            <h3>{t}</h3>
            <I name={ic}/>
          </div>
          <div className="chart-shell" style={{ height: 180 }}>
            <GlucoseChart height={180}/>
          </div>
        </div>
      ))}
    </div>
  </>
);

const NotesPage = () => (
  <>
    <div className="page-h">
      <div>
        <h1>Klinik Notlar</h1>
        <p className="lede">Tüm hastalara ait kısa klinik takip notlarınız.</p>
      </div>
    </div>
    <div className="card">
      <div className="empty" style={{ padding: '72px 24px' }}>
        <div className="ico"><I name="notes"/></div>
        <h4>Henüz not yok</h4>
        <p>Hasta detay sayfasından eklenen klinik notlar burada toplanır.</p>
      </div>
    </div>
  </>
);

const Settings = () => {
  const auth = (typeof useFirebaseAuth === 'function')
    ? useFirebaseAuth()
    : { user: null, profile: null, ready: true };

  const [displayName, setDisplayName] = React.useState('');
  const [institution, setInstitution] = React.useState('');
  const [specialty, setSpecialty] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState(0);
  const [error, setError] = React.useState('');

  // Hydrate from /doctors/{uid} when the profile arrives.
  React.useEffect(() => {
    if (!auth.profile) return;
    setDisplayName(auth.profile.displayName || auth.user?.displayName || '');
    setInstitution(auth.profile.institution || '');
    setSpecialty(auth.profile.specialty || '');
  }, [auth.profile, auth.user]);

  const handleSave = async () => {
    if (!auth.user) return;
    setError('');
    setSaving(true);
    try {
      await window.fbDb.collection('doctors').doc(auth.user.uid).set({
        email: auth.user.email || '',
        displayName: displayName.trim(),
        institution: institution.trim(),
        specialty: specialty.trim(),
      }, { merge: true });
      // Keep auth profile displayName aligned for the sidebar chip.
      if (displayName.trim() && displayName.trim() !== auth.user.displayName) {
        try { await auth.user.updateProfile({ displayName: displayName.trim() }); } catch (_) {}
      }
      setSavedAt(Date.now());
    } catch (err) {
      console.error('[settings] save failed:', err);
      setError('Kaydetme başarısız. Tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      if (typeof window.signOutUser === 'function') {
        await window.signOutUser();
      }
    } catch (err) {
      console.error('[settings] sign-out failed:', err);
      setSigningOut(false);
    }
  };

  const recentlySaved = savedAt && (Date.now() - savedAt < 4000);

  return (
    <>
      <div className="page-h">
        <div>
          <h1>Ayarlar</h1>
          <p className="lede">Hesap, güvenlik ve klinik tercihler.</p>
        </div>
      </div>
      <div className="split-2">
        <div className="card">
          <div className="card-h"><h3>Profil</h3></div>
          <div className="field"><label>Ad Soyad</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Dr. Ad Soyad"/>
          </div>
          <div className="field"><label>Kurum</label>
            <input value={institution} onChange={e => setInstitution(e.target.value)} placeholder="Hastane / Klinik"/>
          </div>
          <div className="field"><label>Branş</label>
            <input value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Endokrinoloji"/>
          </div>
          <div className="field"><label>E-posta</label>
            <input value={auth.user?.email || ''} readOnly style={{ opacity: 0.7 }}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
              disabled={saving || !auth.user}
              style={{ padding: '10px 18px' }}
            >
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
            {recentlySaved && <span style={{ color: '#7be3a3', fontSize: 13 }}>✓ Kaydedildi</span>}
            {error && <span style={{ color: '#ff7a82', fontSize: 13 }}>{error}</span>}
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>Güvenlik & Mahremiyet</h3></div>
          <div className="alert-row">
            <div className="ai" style={{ background: 'rgba(52,195,143,0.12)', color: '#34c38f' }}><I name="shield" size={16}/></div>
            <div className="body">
              <div className="t">İki faktörlü doğrulama aktif</div>
              <div className="s mono">son giriş · — — —</div>
            </div>
          </div>
          <div className="alert-row">
            <div className="ai" style={{ background: 'rgba(52,195,143,0.12)', color: '#34c38f' }}><I name="lock" size={16}/></div>
            <div className="body">
              <div className="t">Tüm hasta erişimleri QR onayı ile</div>
              <div className="s mono">KVKK / GDPR uyumlu veri politikası</div>
            </div>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-h"><h3>Oturum</h3></div>
        <div className="alert-row" style={{ alignItems: 'center' }}>
          <div className="ai" style={{ background: 'rgba(230,57,70,0.12)', color: '#e63946' }}><I name="logout" size={16}/></div>
          <div className="body" style={{ flex: 1 }}>
            <div className="t">Hesaptan çıkış yap</div>
            <div className="s mono">{auth.user?.email || '—'}</div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut || !auth.user}
            style={{
              padding: '10px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              background: 'rgba(230,57,70,0.14)', color: '#ff7a82',
              border: '1px solid rgba(230,57,70,0.42)', cursor: 'pointer',
            }}
          >
            {signingOut ? 'Çıkılıyor…' : 'Çıkış Yap'}
          </button>
        </div>
      </div>
    </>
  );
};

window.Dashboard = Dashboard;
window.Patients = Patients;
window.PatientDetail = PatientDetail;
window.Alerts = Alerts;
window.Reports = Reports;
window.NotesPage = NotesPage;
window.Settings = Settings;
