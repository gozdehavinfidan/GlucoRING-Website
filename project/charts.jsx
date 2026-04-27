// Empty chart shells — ready to bind real data via Firebase later

const ChartGrid = ({ width = 600, height = 240, padding = { l: 44, r: 16, t: 12, b: 28 } }) => {
  const innerW = width - padding.l - padding.r;
  const innerH = height - padding.t - padding.b;
  const gridY = [70, 110, 150, 180, 220];
  const labelsX = ['12:00', '14:00', '16:00', '18:00', '20:00', 'now'];
  return (
    <g>
      {gridY.map((v, i) => {
        const y = padding.t + (1 - (v - 50) / 200) * innerH;
        return (
          <g key={i}>
            <line x1={padding.l} x2={width - padding.r} y1={y} y2={y}
              stroke={v === 70 || v === 180 ? 'rgba(230,57,70,0.25)' : 'rgba(255,255,255,0.05)'}
              strokeDasharray={v === 70 || v === 180 ? '4 4' : '0'}/>
            <text x={padding.l - 8} y={y + 3} fill="#5b616c" fontSize="10" fontFamily="JetBrains Mono" textAnchor="end">{v}</text>
          </g>
        );
      })}
      {labelsX.map((l, i) => {
        const x = padding.l + (i / (labelsX.length - 1)) * innerW;
        return <text key={l} x={x} y={height - 8} fill="#5b616c" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">{l}</text>;
      })}
    </g>
  );
};

const GlucoseChart = ({ style = 'line', height = 280 }) => {
  const w = 700, h = height;
  const padding = { l: 44, r: 16, t: 16, b: 28 };
  const innerW = w - padding.l - padding.r;
  const innerH = h - padding.t - padding.b;

  // Empty placeholder waveform — visual rhythm only, will be replaced by Firebase data
  const ghost = (offsetY = 0, amp = 30, freq = 0.06, phase = 0, opacity = 0.15) => {
    const pts = [];
    for (let i = 0; i <= innerW; i += 4) {
      const noise = Math.sin(i * freq + phase) * amp + Math.sin(i * 0.013 + phase) * amp * 0.5;
      const y = padding.t + innerH / 2 + noise + offsetY;
      pts.push(`${padding.l + i},${y}`);
    }
    return pts.join(' ');
  };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <ChartGrid width={w} height={h} padding={padding}/>
      {/* Hyper / hypo zones */}
      <rect x={padding.l} y={padding.t} width={innerW} height={(180 - 250) / -200 * innerH} fill="rgba(230,57,70,0.04)"/>

      {/* Empty-state ghost lines */}
      {style === 'area' ? (
        <>
          <defs>
            <linearGradient id="gA" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#e63946" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#e63946" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <polyline points={ghost(-12, 24)} fill="none" stroke="rgba(230,57,70,0.2)" strokeWidth="1.5" strokeDasharray="3 3"/>
          <polygon points={`${padding.l},${h - padding.b} ${ghost(-12, 24)} ${padding.l + innerW},${h - padding.b}`} fill="url(#gA)" opacity="0.3"/>
        </>
      ) : style === 'candle' ? (
        Array.from({ length: 18 }).map((_, i) => {
          const x = padding.l + (i / 17) * innerW;
          const cy = padding.t + innerH / 2 + Math.sin(i * 0.7) * 30;
          return <g key={i} opacity="0.2">
            <line x1={x} x2={x} y1={cy - 18} y2={cy + 18} stroke="#e63946" strokeWidth="1"/>
            <rect x={x - 3} y={cy - 6} width="6" height="12" fill="#e63946"/>
          </g>;
        })
      ) : (
        <>
          <polyline points={ghost(0, 28, 0.05, 0)} fill="none" stroke="rgba(230,57,70,0.18)" strokeWidth="2" strokeDasharray="4 4"/>
          <polyline points={ghost(8, 22, 0.04, 1.2)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeDasharray="2 4"/>
        </>
      )}

      {/* "Now" line */}
      <line x1={padding.l + innerW * 0.7} x2={padding.l + innerW * 0.7} y1={padding.t} y2={h - padding.b} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3"/>
      <text x={padding.l + innerW * 0.7 + 6} y={padding.t + 12} fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="JetBrains Mono">NOW</text>

      {/* Empty-state badge */}
      <g transform={`translate(${w / 2}, ${h / 2})`}>
        <rect x="-100" y="-22" width="200" height="44" rx="22" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.08)"/>
        <text x="0" y="2" fill="#9aa0aa" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle" letterSpacing="0.05em">
          AWAITING REAL-TIME DATA
        </text>
        <circle cx="-78" cy="0" r="3" fill="#e63946">
          <animate attributeName="opacity" values="1;0.2;1" dur="1.4s" repeatCount="indefinite"/>
        </circle>
      </g>
    </svg>
  );
};

const Sparkline = ({ color = '#e63946', count = 24 }) => {
  const w = 100, h = 24;
  const pts = Array.from({ length: count }).map((_, i) => {
    const x = (i / (count - 1)) * w;
    const y = h / 2 + Math.sin(i * 0.5) * 6 + Math.cos(i * 0.27) * 3;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={pts} stroke={color} strokeWidth="1.5" fill="none" strokeDasharray="2 2" opacity="0.4"/>
    </svg>
  );
};

window.GlucoseChart = GlucoseChart;
window.Sparkline = Sparkline;
