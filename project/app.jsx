// Root app: routing + tweaks

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
  const [v, setTweak] = (typeof useTweaks === 'function') ? useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, () => {}];
  const tw = { values: v, set: setTweak };

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
      case 'patients': return <Patients onOpen={(target) => target === 'pairing' ? setRoute('qr') : setPage('detail')}/>;
      case 'detail': return <PatientDetail tw={{ chartStyle: v.chartStyle, seasonModel: v.seasonModel }} onBack={() => setPage('patients')}/>;
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

  return (
    <>
      {route === 'landing' && <Landing onEnter={() => setRoute('login')}/>}
      {route === 'login' && <Login onLogin={() => setRoute('qr')} onBack={() => setRoute('landing')}/>}
      {route === 'qr' && <QrPairing onDone={() => { setRoute('app'); setPage('dashboard'); }}/>}
      {route === 'app' && (
        <div className={`app-layout ${v.sidebarCompact ? 'sb-compact' : ''}`} data-screen-label={`App · ${page}`}>
          <Sidebar current={page} compact={v.sidebarCompact} onNav={(p) => { if (p === 'pairing') { setPage('pairing'); } else { setPage(p); } }}/>
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
