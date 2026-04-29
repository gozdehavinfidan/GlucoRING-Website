// Sidebar + main app shell

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Panel', icon: 'home' },
  { id: 'patients', label: 'Hastalar', icon: 'users' },
  { id: 'pairing', label: 'Hasta Eşleştir', icon: 'qr' },
  { id: 'alerts', label: 'Uyarılar', icon: 'bell', badge: '—' },
  { id: 'reports', label: 'Raporlar', icon: 'report' },
  { id: 'notes', label: 'Klinik Notlar', icon: 'notes' },
];
const NAV_BOTTOM = [
  { id: 'settings', label: 'Ayarlar', icon: 'settings' },
];

const Sidebar = ({ current, onNav, compact, userName, userEmail, onSignOut, onBrandClick }) => {
  const displayName = (userName && String(userName).trim()) || 'Kullanıcı';
  const initials = (displayName.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()) || 'DR';
  return (
    <aside className="sidebar">
      <button
        type="button"
        className="sidebar-brand sidebar-brand--btn"
        onClick={onBrandClick}
        title="Ana sayfaya dön"
        aria-label="Ana sayfaya dön">
        {compact ? <Mono size={28}/> : <Logo size={28}/>}
      </button>
      <div className="sidebar-section">İzlem</div>
      {NAV_ITEMS.map(it => (
        <div key={it.id} className={`nav-item ${current === it.id ? 'active' : ''}`} onClick={() => onNav(it.id)}>
          <span className="ico-wrap"><I name={it.icon}/></span>
          <span>{it.label}</span>
          {it.badge && <span className="badge">{it.badge}</span>}
        </div>
      ))}
      <div className="sidebar-section">Sistem</div>
      {NAV_BOTTOM.map(it => (
        <div key={it.id} className={`nav-item ${current === it.id ? 'active' : ''}`} onClick={() => onNav(it.id)}>
          <span className="ico-wrap"><I name={it.icon}/></span>
          <span>{it.label}</span>
        </div>
      ))}
      <div className="sidebar-foot">
        <div className="user-chip">
          <div className="avatar">{initials}</div>
          <div className="meta">
            <div className="name">{displayName}</div>
            <div className="role">{userEmail || ''}</div>
          </div>
          {onSignOut && (
            <button
              className="icon-btn user-chip-signout"
              onClick={onSignOut}
              title="Çıkış Yap"
              aria-label="Çıkış Yap"
              style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, color: 'inherit', display: 'inline-flex', alignItems: 'center' }}
            >
              <I name="logout" size={16}/>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

const Topbar = ({ crumbs }) => (
  <div className="topbar">
    <div className="crumbs mono">
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="sep">/</span>}
          <span className={i === crumbs.length - 1 ? 'now' : ''}>{c}</span>
        </React.Fragment>
      ))}
    </div>
    <div className="search">
      <I name="search" size={14}/>
      <input placeholder="Hasta, ID veya not ara…"/>
      <span className="kbd">⌘K</span>
    </div>
    <button className="icon-btn" title="Senkronize Et"><I name="sync" size={16}/></button>
    <button className="icon-btn" title="Bildirimler">
      <I name="bell" size={16}/>
      <span className="dot-alert"/>
    </button>
  </div>
);

window.Sidebar = Sidebar;
window.Topbar = Topbar;
