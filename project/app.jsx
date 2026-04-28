// Root app: routing + tweaks + Firebase auth gate

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentColor": "#e63946",
  "sidebarCompact": false,
  "seasonModel": "personal",
  "chartStyle": "line",
  "dashLayout": "comfortable"
}/*EDITMODE-END*/;

const App = () => {
  const [route, setRoute] = React.useState('landing'); // landing, login, qr, app
  const [page, setPage] = React.useState('dashboard');
  const [selectedPatientUid, setSelectedPatientUid] = React.useState(null);
  const [v, setTweak] = (typeof useTweaks === 'function') ? useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, () => {}];
  const tw = { values: v, set: setTweak };

  // Firebase auth state — drives route transitions on sign-in/sign-out.
  const auth = (typeof useFirebaseAuth === 'function')
    ? useFirebaseAuth()
    : { user: null, profile: null, ready: true };

  // When auth state resolves: if signed in and we're parked on a public route
  // (landing/login), advance into the app. If signed out and we're inside the
  // app (or QR pairing), bounce back to landing.
  React.useEffect(() => {
    if (!auth.ready) return;
    if (auth.user) {
      if (route === 'landing' || route === 'login') {
        setRoute('app');
        setPage('dashboard');
      }
    } else {
      if (route === 'app' || route === 'qr') {
        setRoute('landing');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.ready, auth.user]);

  // Apply accent color globally
  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent', v.accentColor);
    // Recompute soft + glow
    const hex = v.accentColor.replace('#','');
    const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
    document.documentElement.style.setProperty('--accent-soft', `rgba(${r},${g},${b},0.14)`);
    document.documentElement.style.setProperty('--accent-glow', `rgba(${r},${g},${b},0.45)`);
  }, [v.accentColor]);

  React.useEffect(() => {
    // Sidebar width
    document.documentElement.style.setProperty('--sidebar-w', v.sidebarCompact ? '72px' : '248px');
  }, [v.sidebarCompact]);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard tw={{ chartStyle: v.chartStyle, layout: v.dashLayout }}/>;
      case 'patients': return <Patients
        onOpen={(target) => target === 'pairing' ? setRoute('qr') : setPage('detail')}
        onSelect={(uid) => { setSelectedPatientUid(uid); setPage('detail'); }}
      />;
      case 'detail': return <PatientDetail
        patientUid={selectedPatientUid}
        tw={{ chartStyle: v.chartStyle, seasonModel: v.seasonModel }}
        onBack={() => setPage('patients')}
      />;
      case 'pairing': return <div style={{ marginTop: -28, marginLeft: -36, marginRight: -36 }}><QrPairing onDone={() => setPage('patients')}/></div>;
      case 'alerts': return <Alerts/>;
      case 'reports': return <Reports/>;
      case 'notes': return <NotesPage/>;
      case 'settings': return <Settings/>;
      default: return <Dashboard tw={{ chartStyle: v.chartStyle, layout: v.dashLayout }}/>;
    }
  };

  const crumbsMap = {
    dashboard: ['Klinik İzlem', 'Panel'],
    patients: ['Klinik İzlem', 'Hastalar'],
    detail: ['Klinik İzlem', 'Hastalar', 'Detay'],
    pairing: ['Klinik İzlem', 'Hasta Eşleştir'],
    alerts: ['Klinik İzlem', 'Uyarılar'],
    reports: ['Klinik İzlem', 'Raporlar'],
    notes: ['Klinik İzlem', 'Klinik Notlar'],
    settings: ['Klinik İzlem', 'Ayarlar'],
  };

  // Wait for auth state to resolve before rendering anything other than the
  // public landing — avoids a flash of "logged out" UI for returning users.
  if (!auth.ready) {
    return <div style={{ background: '#0a0e0c', minHeight: '100vh' }}/>;
  }

  // Computed user-chip props for the sidebar
  const userName = auth.profile?.displayName || auth.user?.displayName || auth.user?.email || 'Kullanıcı';
  const userEmail = auth.user?.email || '';
  const handleSignOut = async () => {
    try {
      if (typeof window.signOutUser === 'function') {
        await window.signOutUser();
      }
    } catch (err) {
      console.error('[app] sign-out failed:', err);
    }
  };

  return (
    <>
      {route === 'landing' && <Landing onEnter={() => setRoute('login')}/>}
      {route === 'login' && <Login onBack={() => setRoute('landing')}/>}
      {route === 'qr' && <QrPairing onDone={() => { setRoute('app'); setPage('dashboard'); }}/>}
      {route === 'app' && (
        <div className={`app-layout ${v.sidebarCompact ? 'sb-compact' : ''}`} data-screen-label={`App · ${page}`}>
          <Sidebar
            current={page}
            compact={v.sidebarCompact}
            onNav={(p) => { if (p === 'pairing') { setPage('pairing'); } else { setPage(p); } }}
            userName={userName}
            userEmail={userEmail}
            onSignOut={handleSignOut}
          />
          <main className="main">
            <Topbar crumbs={crumbsMap[page] || ['Klinik İzlem']}/>
            {renderPage()}
          </main>
        </div>
      )}

      {/* Tweaks panel */}
      {typeof TweaksPanel === 'function' && (
        <TweaksPanel title="Tweaks">
          <TweakSection title="Marka">
            <TweakColor label="Vurgu Rengi" value={v.accentColor} onChange={(x) => tw.set('accentColor', x)}/>
            <TweakRadio label="Vurgu Hazır Tonu" value={v.accentColor}
              options={[
                ['#e63946', 'Saf K.'],
                ['#a02232', 'Kan'],
                ['#ff5a5f', 'Coral'],
                ['#dc2626', 'Tang.'],
              ]}
              onChange={(x) => tw.set('accentColor', x)}/>
          </TweakSection>

          <TweakSection title="Düzen">
            <TweakToggle label="Sidebar Kompakt" value={v.sidebarCompact} onChange={(x) => tw.set('sidebarCompact', x)}/>
            <TweakRadio label="Dashboard Düzeni" value={v.dashLayout}
              options={[['comfortable','Geniş'], ['compact','Kompakt'], ['bento','Bento']]}
              onChange={(x) => tw.set('dashLayout', x)}/>
          </TweakSection>

          <TweakSection title="Grafikler">
            <TweakRadio label="Stil" value={v.chartStyle}
              options={[['line','Line'], ['area','Area'], ['candle','Candle']]}
              onChange={(x) => tw.set('chartStyle', x)}/>
          </TweakSection>

          <TweakSection title="Hasta Detay">
            <TweakRadio label="Sezon Modeli" value={v.seasonModel}
              options={[['summer','Yaz · KF'], ['winter','Kış · EKF'], ['personal','Kişisel · UKF']]}
              onChange={(x) => tw.set('seasonModel', x)}/>
          </TweakSection>

          <TweakSection title="Navigasyon">
            <TweakButton onClick={() => setRoute('landing')}>→ Landing</TweakButton>
            <TweakButton onClick={() => setRoute('login')}>→ Login</TweakButton>
            <TweakButton onClick={() => setRoute('qr')}>→ QR Eşleştir</TweakButton>
            <TweakButton onClick={() => { setRoute('app'); setPage('dashboard'); }}>→ Dashboard</TweakButton>
            <TweakButton onClick={() => { setRoute('app'); setPage('patients'); }}>→ Hastalar</TweakButton>
            <TweakButton onClick={() => { setRoute('app'); setPage('detail'); }}>→ Hasta Detay</TweakButton>
            <TweakButton onClick={() => { setRoute('app'); setPage('alerts'); }}>→ Uyarılar</TweakButton>
            <TweakButton onClick={() => { setRoute('app'); setPage('reports'); }}>→ Raporlar</TweakButton>
          </TweakSection>
        </TweaksPanel>
      )}
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App/>);
