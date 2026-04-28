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

const StatCard = ({ label, value, unit, hint, icon, tone }) => {
  const isText = typeof value === 'string' && !/^[\d\.\-,]+$/.test(value);
  return (
    <div className={`stat-big ${tone ? 'stat-big--' + tone : ''}`}>
      <div className="stat-big-head">
        <span className="stat-big-lbl">{label}</span>
        <span className="stat-big-ico"><I name={icon}/></span>
      </div>
      <div className={`stat-big-num ${isText ? 'is-text' : 'mono'}`}>
        {value != null && value !== '' ? value : '—'}
        {unit && value != null && !isText ? <span className="stat-big-unit">{unit}</span> : null}
      </div>
      <div className="stat-big-hint" dangerouslySetInnerHTML={{ __html: hint || '' }}/>
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

  // For each linked patient, subscribe to last 24h healthMetrics. Cap at 12 patients
  // so the dashboard doesn't fan out into hundreds of listeners.
  React.useEffect(() => {
    if (!window.fbDb || !links.length) {
      setReadings({});
      return;
    }
    const unsubs = [];
    const sinceMs = Date.now() - ONE_DAY_MS;
    const visiblePatients = links.slice(0, 12).map((l) => l.patientUid).filter(Boolean);
    visiblePatients.forEach((uid) => {
      const unsub = window.fbDb
        .collection('patients').doc(uid)
        .collection('healthMetrics')
        .where('timestamp', '>=', sinceMs)
        .orderBy('timestamp', 'desc')
        .limit(120)
        .onSnapshot((snap) => {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setReadings((prev) => ({
            ...prev,
            [uid]: { latest: docs[0] || null, last24h: docs },
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
    || 'Kullanıcı';
  const greeting = `İyi günler, Dr. ${doctorName}.`;

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
            ? `${activeCount} aktif eşleşmiş hasta. Son 24 saatte ${allReadings.length} okuma alındı.`
            : 'Henüz aktif eşleşme yok. QR kod ile bir hasta bağlayın; veri ve uyarılar burada akmaya başlar.'}</p>
        </div>
        <div className="row gap-12">
          <button className="btn-pill ghost" style={{ padding: '10px 16px' }} onClick={goToPatients}>
            <I name="users" size={14}/> Hasta Listesi
          </button>
          <button className="btn-pill btn-accent" style={{ padding: '10px 16px' }} onClick={goToPairing}>
            <I name="plus" size={14}/> Yeni Hasta Eşleştir
          </button>
        </div>
      </div>

      <div className="stat-row">
        <StatCard
          label="AKTİF HASTA"
          value={linksLoading ? '…' : activeCount}
          icon="users"
          tone="accent"
          hint={activeCount > 0 ? `${activeCount} eşleşme · canlı izlemede` : 'henüz eşleşme yok — QR kodla başlayın'}
        />
        <StatCard
          label="HİPOGLİSEMİ · 24 SA"
          value={hypoEvents.length}
          icon="arrowDown"
          tone={hypoEvents.length > 0 ? 'warn' : null}
          hint={hypoEvents.length > 0 ? `${hypoPatients} hasta · &lt; ${HYPO_THRESHOLD} mg/dL` : 'eşik altı okuma yok'}
        />
        <StatCard
          label="HİPERGLİSEMİ · 24 SA"
          value={hyperEvents.length}
          icon="arrowUp"
          tone={hyperEvents.length > 0 ? 'danger' : null}
          hint={hyperEvents.length > 0 ? `&gt; ${HYPER_THRESHOLD} mg/dL eşiği aşıldı` : 'eşik üstü okuma yok'}
        />
        <StatCard
          label="SON SENKRON"
          value={lastSyncLabel}
          icon="sync"
          hint={lastSyncMs ? new Date(lastSyncMs).toLocaleString('tr-TR') : 'henüz okuma alınmadı'}
        />
      </div>

      <div className="card mt-28">
        <div className="card-h">
          <h3>Hasta Akışı</h3>
          <div className="meta mono">canlı · /patients/.../healthMetrics</div>
        </div>
        {linksLoading && (
          <div className="empty" style={{ padding: '48px 16px' }}>
            <div className="ico"><I name="sync"/></div>
            <h4>Yükleniyor…</h4>
            <p>Eşleşmeler ve canlı veri okunuyor.</p>
          </div>
        )}
        {!linksLoading && activeCount === 0 && (
          <div className="empty" style={{ padding: '56px 16px' }}>
            <div className="ico"><I name="users"/></div>
            <h4>Aktif eşleşme yok</h4>
            <p>İzlemek için bir hastayla QR kod üzerinden bağlanın. Onay verince burada satır olarak görünür.</p>
            <div style={{ marginTop: 18 }}>
              <button className="btn-pill btn-accent" style={{ padding: '10px 18px' }} onClick={goToPairing}>
                <I name="plus" size={14}/> İlk Hastayı Eşleştir
              </button>
            </div>
          </div>
        )}
        {!linksLoading && activeCount > 0 && feed.length === 0 && (
          <div className="empty" style={{ padding: '48px 16px' }}>
            <div className="ico"><I name="pulse"/></div>
            <h4>Veri akışı bekleniyor</h4>
            <p>{activeCount} hasta eşleşmiş ama henüz okuma alınmamış. Yüzükten ilk veri geldiğinde burada akmaya başlar.</p>
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
    summer: { name: 'Yaz Modeli (Summer)', filter: 'KF + Q-Learning', icon: 'sun' },
    winter: { name: 'Kış Modeli (Winter)', filter: 'EKF + Q-Learning', icon: 'snow' },
    personal: { name: 'Kişiselleştirilmiş Sezonsal', filter: 'UKF + Q-Learning', icon: 'spark' },
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

      <div className="patient-head">
        <div className="patient-avatar">{patientUid ? patientUid.slice(-2).toUpperCase() : '—'}</div>
        <div className="patient-meta">
          <h2>{patientLabel}</h2>
          <div className="row">
            <span className="mono" style={{ fontSize: 12, color: 'var(--text-mute)', letterSpacing: '0.04em' }}>{patientUid || 'PT-XXXX'}</span>
            <span className="pill gray"><span className="pdot"/> {reading ? 'aktif veri akışı' : (loading ? 'yükleniyor…' : 'veri yok')}</span>
          </div>
          <div className="row mt-12">
            <span className="item"><span className="lbl">Kaynak:</span> {reading?.dataSource || '—'}</span>
            <span className="item"><span className="lbl">Son Senkron:</span> {lastSync}</span>
            <span className="item"><span className="lbl">Aykırı:</span> {reading?.isOutlier ? 'evet' : reading ? 'hayır' : '—'}</span>
            <span className="item"><span className="lbl">Adım:</span> {fmt(reading?.stepCount)}</span>
          </div>
        </div>
        <div className="patient-actions">
          <button className="icon-btn" title="Yenile"><I name="refresh" size={16}/></button>
          <button className="icon-btn" title="Rapor"><I name="report" size={16}/></button>
          <button className="btn-pill btn-accent" style={{ padding: '10px 16px' }}>
            <I name="download" size={14}/> PDF Rapor
          </button>
        </div>
      </div>

      <div className="glucose-hero">
        <div className="glucose-now">
          <div className="lbl">GÜNCEL GLUKOZ</div>
          <div className="val mono">{fmt(reading?.bloodGlucose)} <span className="unit">mg/dL</span></div>
          <div className="trend mono"><I name="arrow" size={14}/> {reading ? lastSync : 'veri bekleniyor'}</div>
        </div>
        <div className="predict-grid">
          {['5', '15', '30'].map(h => (
            <div key={h} className="predict-tile">
              <div className="horizon">+{h} DK TAHMİN</div>
              <div className="v mono">—</div>
              <div className="delta mono">model bekleniyor</div>
            </div>
          ))}
        </div>
        <div className="season-card">
          <div className="lbl"><I name={seasonInfo.icon} size={12}/> AKTIF SEZON</div>
          <div className="model">{seasonInfo.name}</div>
          <div className="filter mono">{seasonInfo.filter}</div>
          <div className="updated mono">Güncellendi · {lastSync}</div>
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

      <div className="card mb-20">
        <div className="card-h">
          <h3>Fizyolojik Parametreler · Akıllı Yüzük</h3>
          <div className="meta mono">son 1 saat</div>
        </div>
        <div className="vitals-grid">
          <div className="vital">
            <div className="h"><span className="ico"><I name="heart" size={14}/></span> Kalp Atışı</div>
            <div className="v mono">{fmt(reading?.heartRate)} <span className="u">bpm</span></div>
            <div className="spark"><Sparkline/></div>
          </div>
          <div className="vital">
            <div className="h"><span className="ico"><I name="temp" size={14}/></span> Vücut Sıc.</div>
            <div className="v mono">{fmt(reading?.bodyTemperature, 1)} <span className="u">°C</span></div>
            <div className="spark"><Sparkline color="#f5b73d"/></div>
          </div>
          <div className="vital">
            <div className="h"><span className="ico"><I name="spo2" size={14}/></span> SpO₂</div>
            <div className="v mono">{fmt(reading?.oxygenSaturation)} <span className="u">%</span></div>
            <div className="spark"><Sparkline color="#34c38f"/></div>
          </div>
          <div className="vital">
            <div className="h"><span className="ico"><I name="activity" size={14}/></span> HRV (SDNN)</div>
            <div className="v mono">{fmt(reading?.hrvSdnn)} <span className="u">ms</span></div>
            <div className="spark"><Sparkline color="#9aa0aa"/></div>
          </div>
        </div>
      </div>

      <div className="split-2">
        <div className="card">
          <div className="card-h">
            <h3>Risk & Uyarı Geçmişi</h3>
            <div className="meta mono">stream · /alerts</div>
          </div>
          <div className="empty" style={{ padding: '40px 16px' }}>
            <div className="ico"><I name="bell"/></div>
            <h4>Uyarı yok</h4>
            <p>Hipoglisemi veya hiperglisemi öngörüldüğünde burada listelenir.</p>
            <span className="hint mono">/patients/{`{id}`}/alerts</span>
          </div>
        </div>
        <div className="card">
          <div className="card-h">
            <h3>Klinik Notlar</h3>
            <button className="icon-btn" style={{ width: 28, height: 28 }}><I name="plus" size={14}/></button>
          </div>
          <div className="empty" style={{ padding: '32px 16px' }}>
            <div className="ico"><I name="notes"/></div>
            <h4>Henüz not yok</h4>
            <p>Klinik takip notlarınız tarih ve hekim adı ile kaydedilir.</p>
          </div>
          <div className="note-input">
            <textarea placeholder="Klinik takip notu ekleyin… (tedavi önerisi değil)"/>
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn-pill btn-accent" style={{ padding: '8px 16px', fontSize: 14 }}>Kaydet</button>
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
