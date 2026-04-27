// GlucoRING Brand mark + icons
const Logo = ({ size = 28 }) => (
  <span className="brand-mark">
    <span className="glyph" style={{ width: size, height: size }}>
      <svg viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2.2" opacity="0.95"/>
        <circle cx="16" cy="16" r="8" stroke="#e63946" strokeWidth="1.6" opacity="0.9"/>
        <path d="M5 16 Q 10 12, 14 16 T 22 16 T 27 16" stroke="#e63946" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        <circle cx="16" cy="16" r="1.6" fill="#e63946"/>
      </svg>
    </span>
    <span className="brand-wordmark">Gluco<span>RING</span></span>
  </span>
);

const Mono = ({ size = 28 }) => (
  <span className="glyph" style={{ width: size, height: size, color: '#fff' }}>
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2.2"/>
      <circle cx="16" cy="16" r="8" stroke="#e63946" strokeWidth="1.6"/>
      <path d="M5 16 Q 10 12, 14 16 T 22 16 T 27 16" stroke="#e63946" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <circle cx="16" cy="16" r="1.6" fill="#e63946"/>
    </svg>
  </span>
);

// Icons (stroke-based, 18x18 default)
const I = ({ name, size = 18, stroke = 1.6 }) => {
  const s = stroke;
  const paths = {
    home: <><path d="M3 11l7-7 7 7" stroke="currentColor" strokeWidth={s} strokeLinecap="round" strokeLinejoin="round"/><path d="M5 9v8h10V9" stroke="currentColor" strokeWidth={s} strokeLinecap="round" strokeLinejoin="round"/></>,
    users: <><circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth={s}/><path d="M2 17c0-3 2.2-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/><circle cx="13.5" cy="8" r="2.2" stroke="currentColor" strokeWidth={s}/><path d="M12 17c0-2 1-3.5 3-3.5s3 1.5 3 3.5" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/></>,
    user: <><circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth={s}/><path d="M3 17c0-3.5 3-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/></>,
    qr: <><rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth={s}/><rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth={s}/><rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth={s}/><path d="M11 11h2v2h-2zM15 11h2M11 15h2v2h-2zM15 15v2" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/></>,
    chart: <><path d="M3 17V3M3 17h14" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/><path d="M6 13l3-4 3 2 4-6" stroke="currentColor" strokeWidth={s} strokeLinecap="round" strokeLinejoin="round"/></>,
    pulse: <><path d="M2 10h4l2-5 4 10 2-5h4" stroke="currentColor" strokeWidth={s} strokeLinecap="round" strokeLinejoin="round"/></>,
    bell: <><path d="M5 8a5 5 0 0110 0v4l1.5 2.5h-13L5 12V8z" stroke="currentColor" strokeWidth={s} strokeLinejoin="round"/><path d="M8 17a2 2 0 004 0" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/></>,
    notes: <><rect x="4" y="3" width="12" height="14" rx="2" stroke="currentColor" strokeWidth={s}/><path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/></>,
    report: <><rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth={s}/><path d="M7 8v5M10 6v7M13 10v3" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/></>,
    settings: <><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth={s}/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.5 4.5l1.5 1.5M14 14l1.5 1.5M4.5 15.5l1.5-1.5M14 6l1.5-1.5" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/></>,
    search: <><circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth={s}/><path d="M13 13l3 3" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/></>,
    arrow: <path d="M4 10h12m-4-4l4 4-4 4" stroke="currentColor" strokeWidth={s} strokeLinecap="round" strokeLinejoin="round"/>,
    arrowDown: <path d="M10 4v12m-4-4l4 4 4-4" stroke="currentColor" strokeWidth={s} strokeLinecap="round" strokeLinejoin="round"/>,
    arrowUp: <path d="M10 16V4m-4 4l4-4 4 4" stroke="currentColor" strokeWidth={s} strokeLinecap="round" strokeLinejoin="round"/>,
    plus: <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/>,
    download: <><path d="M10 3v10m-4-4l4 4 4-4" stroke="currentColor" strokeWidth={s} strokeLinecap="round" strokeLinejoin="round"/><path d="M3 16h14" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/></>,
    sun: <><circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth={s}/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.5 4.5l1.5 1.5M14 14l1.5 1.5M4.5 15.5l1.5-1.5M14 6l1.5-1.5" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/></>,
    snow: <path d="M10 2v16M3 10h14M4.5 4.5l11 11M15.5 4.5l-11 11" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/>,
    spark: <path d="M10 3v6m0 0l3-3m-3 3l-3-3M3 14l4-4 3 2 4-5 3 3" stroke="currentColor" strokeWidth={s} strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    heart: <path d="M10 16s-6-3.5-6-8a3.5 3.5 0 016-2.5A3.5 3.5 0 0116 8c0 4.5-6 8-6 8z" stroke="currentColor" strokeWidth={s} strokeLinejoin="round"/>,
    temp: <><path d="M9 3a1.5 1.5 0 113 0v8a3.5 3.5 0 11-3 0V3z" stroke="currentColor" strokeWidth={s}/><path d="M10.5 7v5" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/></>,
    spo2: <><circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth={s}/><path d="M7 10c1 1.5 2 1.5 3 0s2-1.5 3 0" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/></>,
    activity: <path d="M2 10h3l2-5 3 10 2-5h6" stroke="currentColor" strokeWidth={s} strokeLinecap="round" strokeLinejoin="round"/>,
    lock: <><rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth={s}/><path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth={s}/></>,
    shield: <path d="M10 2l6 2v5c0 4-3 7-6 9-3-2-6-5-6-9V4l6-2z" stroke="currentColor" strokeWidth={s} strokeLinejoin="round"/>,
    refresh: <path d="M3 10a7 7 0 0112-5l2 2m0-4v4h-4M17 10a7 7 0 01-12 5l-2-2m0 4v-4h4" stroke="currentColor" strokeWidth={s} strokeLinecap="round" strokeLinejoin="round"/>,
    menu: <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/>,
    close: <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/>,
    check: <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth={s} strokeLinecap="round" strokeLinejoin="round"/>,
    chevR: <path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth={s} strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    sync: <path d="M3 7a6 6 0 0110-2l2 2m-3 0h3V4M17 13a6 6 0 01-10 2l-2-2m3 0H5v3" stroke="currentColor" strokeWidth={s} strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    clock: <><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth={s}/><path d="M10 6v4l3 2" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/></>,
    bluetooth: <path d="M7 5l6 5-6 5V5l6 5" stroke="currentColor" strokeWidth={s} strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    chip: <><rect x="5" y="5" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth={s}/><rect x="8" y="8" width="4" height="4" stroke="currentColor" strokeWidth={s}/><path d="M8 3v2M12 3v2M8 15v2M12 15v2M3 8h2M3 12h2M15 8h2M15 12h2" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/></>,
    battery: <><rect x="2" y="7" width="14" height="6" rx="1" stroke="currentColor" strokeWidth={s}/><rect x="4" y="9" width="6" height="2" fill="currentColor"/><path d="M17 9v2" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/></>,
    wave: <path d="M2 10c2-3 4-3 6 0s4 3 6 0 4-3 4-3" stroke="currentColor" strokeWidth={s} strokeLinecap="round" fill="none"/>,
    therm: <><path d="M9 3a1.5 1.5 0 113 0v8a3.5 3.5 0 11-3 0V3z" stroke="currentColor" strokeWidth={s}/><circle cx="10.5" cy="14" r="1.5" fill="currentColor"/></>,
    gauge: <><path d="M3 13a7 7 0 0114 0" stroke="currentColor" strokeWidth={s} strokeLinecap="round" fill="none"/><path d="M10 13l3-4" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/><circle cx="10" cy="13" r="1" fill="currentColor"/></>,
    step: <path d="M6 4c-1 2-1 3 0 5s0 3-1 5l2 2 1-3c1-1 2-2 2-4s-1-3-1-4zM13 8c-1 1-1 2 0 3l2 1 1-2c-1-1-2-1-3-2z" stroke="currentColor" strokeWidth={s} strokeLinejoin="round" fill="none"/>,
    flame: <path d="M10 2c2 3 4 5 4 8a4 4 0 01-8 0c0-2 1-3 2-4 0 1 1 2 2 2 0-2 0-4 0-6z" stroke="currentColor" strokeWidth={s} strokeLinejoin="round" fill="none"/>,
    line: <path d="M3 14l3-5 3 3 3-7 3 5 2-2" stroke="currentColor" strokeWidth={s} strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    moon: <path d="M15 11a6 6 0 01-7-8 6 6 0 107 8z" stroke="currentColor" strokeWidth={s} strokeLinejoin="round" fill="none"/>,
    drop: <path d="M10 3s-5 5-5 9a5 5 0 0010 0c0-4-5-9-5-9z" stroke="currentColor" strokeWidth={s} strokeLinejoin="round" fill="none"/>,
    x: <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth={s} strokeLinecap="round"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      {paths[name] || null}
    </svg>
  );
};

window.Logo = Logo;
window.Mono = Mono;
window.I = I;
