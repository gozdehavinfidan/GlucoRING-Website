// Glucose chart — binds real history when present, falls back to a richer
// synthetic preview that survives in light mode (no hardcoded white opacities).
console.log('[GlucoseChart] build=20260429-uid-labels loaded at', new Date().toISOString());

const Y_MIN = 50, Y_MAX = 250;
const HYPO = 70, HYPER = 180;

const ChartGrid = ({ width = 600, height = 240, padding = { l: 44, r: 16, t: 12, b: 28 }, xLabels = ['12:00', '14:00', '16:00', '18:00', '20:00', 'now'] }) => {
  const innerW = width - padding.l - padding.r;
  const innerH = height - padding.t - padding.b;
  const gridY = [70, 110, 150, 180, 220];
  // Threshold lines split semantically: HYPER is amber (chronic warning),
  // HYPO is red (acute crisis). Mid-grid lines stay neutral.
  return (
    <g>
      {gridY.map((v, i) => {
        const y = padding.t + (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * innerH;
        const isHyper = v === HYPER;
        const isHypo = v === HYPO;
        const stroke = isHyper
          ? 'var(--chart-hyper, rgba(245,183,61,0.55))'
          : isHypo
            ? 'var(--chart-hypo, rgba(230,57,70,0.55))'
            : 'var(--grid-line, rgba(120,120,120,0.12))';
        const labelFill = isHyper
          ? 'var(--chart-hyper, #c47812)'
          : isHypo
            ? 'var(--chart-hypo, #b91c2c)'
            : 'var(--text-mute)';
        return (
          <g key={i}>
            <line x1={padding.l} x2={width - padding.r} y1={y} y2={y}
              stroke={stroke}
              strokeDasharray={isHyper || isHypo ? '4 4' : '0'}
              opacity={isHyper || isHypo ? 0.55 : 1}/>
            <text x={padding.l - 10} y={y + 4} fill={labelFill}
                  fontSize="14" fontFamily="JetBrains Mono" textAnchor="end"
                  fontWeight={isHyper || isHypo ? 700 : 500}>{v}</text>
          </g>
        );
      })}
      {xLabels.map((l, i) => {
        const x = padding.l + (i / (xLabels.length - 1)) * innerW;
        return <text key={l + i} x={x} y={height - 8} fill="var(--text-mute)" fontSize="13.5" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="500">{l}</text>;
      })}
    </g>
  );
};

// Build a chronological series from raw Firestore history (sorted desc by
// timestamp). Returns three things instead of just points:
//   points:       [{x,y,g,t}] for every doc, with nulls interpolated
//   originalMask: boolean[] — true when bloodGlucose came from sensor, false
//                 when filled by interpolation. Used to draw measurement dots
//                 only on real readings, never on filled ones.
//   gaps:         [{xStart,xEnd,tStart,tEnd}] — visual no-data bands where
//                 consecutive docs are spaced further than `gapThreshold` ms
//                 apart. Threshold adapts to the median sample interval so
//                 it works for 5-min cadence and irregular test data alike.
const buildSeries = (history, padding, innerW, innerH) => {
  const empty = { points: [], originalMask: [], gaps: [] };
  if (!Array.isArray(history) || history.length === 0) return empty;
  const yFor = (v) => padding.t + (1 - (Math.max(Y_MIN, Math.min(Y_MAX, v)) - Y_MIN) / (Y_MAX - Y_MIN)) * innerH;

  const docs = history
    .slice()
    .reverse()
    .filter((d) => d && d.timestamp != null);
  if (docs.length === 0) return empty;

  const values = docs.map((d) => (d.bloodGlucose != null ? Number(d.bloodGlucose) : null));
  const originalMask = values.map((v) => v != null);
  if (!originalMask.some(Boolean)) return empty;

  // Time-weighted linear interpolation for null cells.
  const filled = values.slice();
  for (let i = 0; i < filled.length; i++) {
    if (filled[i] != null) continue;
    let prev = -1, next = -1;
    for (let j = i - 1; j >= 0; j--) if (values[j] != null) { prev = j; break; }
    for (let j = i + 1; j < values.length; j++) if (values[j] != null) { next = j; break; }
    if (prev < 0 && next >= 0) { filled[i] = values[next]; continue; }
    if (next < 0 && prev >= 0) { filled[i] = values[prev]; continue; }
    const tPrev = Number(docs[prev].timestamp);
    const tNext = Number(docs[next].timestamp);
    const tHere = Number(docs[i].timestamp);
    const w = tNext === tPrev ? 0 : (tHere - tPrev) / (tNext - tPrev);
    filled[i] = values[prev] + (values[next] - values[prev]) * w;
  }

  const t0 = Number(docs[0].timestamp);
  const t1 = Number(docs[docs.length - 1].timestamp);
  const span = t1 - t0 || 1;
  const xFor = (t) => padding.l + ((t - t0) / span) * innerW;

  const points = docs.map((d, i) => {
    const t = Number(d.timestamp);
    return { x: xFor(t), y: yFor(filled[i]), g: filled[i], t };
  });

  // Adaptive gap detection. Use median delta × 3, floored at 10 minutes so
  // tightly packed test data does not over-flag gaps.
  const deltas = [];
  for (let i = 1; i < docs.length; i++) {
    deltas.push(Number(docs[i].timestamp) - Number(docs[i - 1].timestamp));
  }
  const sortedDeltas = deltas.slice().sort((a, b) => a - b);
  const median = sortedDeltas.length ? sortedDeltas[Math.floor(sortedDeltas.length / 2)] : 0;
  const gapThreshold = Math.max(median * 3, 10 * 60 * 1000);

  const gaps = [];
  for (let i = 1; i < docs.length; i++) {
    const dt = Number(docs[i].timestamp) - Number(docs[i - 1].timestamp);
    if (dt > gapThreshold) {
      gaps.push({
        xStart: xFor(Number(docs[i - 1].timestamp)),
        xEnd: xFor(Number(docs[i].timestamp)),
        tStart: Number(docs[i - 1].timestamp),
        tEnd: Number(docs[i].timestamp),
      });
    }
  }

  return { points, originalMask, gaps };
};

// Synthetic 24h-ish preview — varies enough to read as content,
// uses theme tokens so it stays visible in light mode.
const buildPreview = (padding, innerW, innerH) => {
  const yFor = (v) => padding.t + (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * innerH;
  const pts = [];
  // Anchor points roughly: morning baseline, post-meal spike, afternoon dip,
  // evening spike, late-night drift. Smoothed via a cosine envelope.
  const anchors = [118, 132, 168, 142, 124, 108, 96, 144, 188, 172, 150, 128];
  const N = 96; // resolution
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * (anchors.length - 1);
    const i0 = Math.floor(t), i1 = Math.min(anchors.length - 1, i0 + 1);
    const f = t - i0;
    const smooth = (1 - Math.cos(f * Math.PI)) / 2;
    const base = anchors[i0] * (1 - smooth) + anchors[i1] * smooth;
    const jitter = Math.sin(i * 0.7) * 3 + Math.sin(i * 0.21) * 2;
    const g = base + jitter;
    const x = padding.l + (i / N) * innerW;
    pts.push({ x, y: yFor(g), g });
  }
  return pts;
};

const polylineStr = (pts) => pts.map((p) => `${p.x},${p.y}`).join(' ');

const GlucoseChart = ({ style = 'line', height = 280, history = [], horizon = '15' }) => {
  // viewBox is wider than before (1100×h) so on full-screen containers the SVG
  // does not get horizontally stretched. Combined with preserveAspectRatio
  // "xMidYMid meet" the chart keeps a healthy 3.4:1 aspect across viewports.
  const w = 1100, h = height;
  const padding = { l: 60, r: 28, t: 38, b: 38 };
  const innerW = w - padding.l - padding.r;
  const innerH = h - padding.t - padding.b;
  const yFor = (v) => padding.t + (1 - (Math.max(Y_MIN, Math.min(Y_MAX, v)) - Y_MIN) / (Y_MAX - Y_MIN)) * innerH;

  const real = React.useMemo(() => buildSeries(history, padding, innerW, innerH), [history, innerW, innerH]);
  const preview = React.useMemo(() => buildPreview(padding, innerW, innerH), [innerW, innerH]);
  const hasReal = real.points.length >= 2;

  // Split actual line into segments at every detected gap so the polyline
  // does not connect across no-data periods. For synthetic preview, the
  // "actual" portion is the first 78% of the curve (the rest belongs to
  // predicted) — so we slice it to match and avoid drawing the predicted
  // segment twice.
  const segments = React.useMemo(() => {
    if (!hasReal) {
      const predStart = Math.floor(preview.length * 0.78);
      return [preview.slice(0, predStart + 1)];
    }
    const pts = real.points;
    if (real.gaps.length === 0) return [pts];
    const gapStartTimes = new Set(real.gaps.map((g) => g.tStart));
    const out = [];
    let cur = [];
    for (let i = 0; i < pts.length; i++) {
      cur.push(pts[i]);
      if (gapStartTimes.has(pts[i].t)) {
        out.push(cur);
        cur = [];
      }
    }
    if (cur.length) out.push(cur);
    return out.filter((s) => s.length > 0);
  }, [hasReal, real, preview]);

  // Predicted segment — short forward extrapolation from the last two real
  // points, dampened and clamped. Synthetic preview keeps a dashed tail.
  let predicted, nowX;
  if (hasReal) {
    const pts = real.points;
    const last = pts[pts.length - 1];
    const prev = pts[pts.length - 2];
    const ext = innerW * 0.10;
    const dxPrev = last.x - prev.x;
    const slopeG = dxPrev === 0 ? 0 : (last.g - prev.g) / dxPrev;
    const futureG = Math.max(Y_MIN, Math.min(Y_MAX, last.g + slopeG * ext * 0.5));
    predicted = [last, { x: last.x + ext, y: yFor(futureG), g: futureG }];
    nowX = last.x;
  } else {
    const pts = preview;
    const predStart = Math.floor(pts.length * 0.78);
    predicted = pts.slice(predStart);
    nowX = predicted.length ? predicted[0].x : padding.l + innerW * 0.78;
  }

  // Time-based x-axis labels from real timestamps. Adapts the label format
  // based on the spanned duration: short spans get HH:MM:SS, longer get HH:MM.
  const fmtTime = (ms, withSeconds) => {
    const d = new Date(Number(ms));
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    if (!withSeconds) return `${hh}:${mm}`;
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };
  const xLabels = (() => {
    if (!hasReal) return ['00:00', '04:00', '08:00', '12:00', '16:00', 'şimdi'];
    const t0 = real.points[0].t, t1 = real.points[real.points.length - 1].t;
    const span = t1 - t0;
    const withSeconds = span < 5 * 60 * 1000; // < 5 min → show seconds
    return [0, 0.2, 0.4, 0.6, 0.8, 1].map((f) => fmtTime(t0 + span * f, withSeconds));
  })();

  // Sparse dots — show ONLY originally measured readings (not interpolated),
  // capped at 6 across the full series. Filtering by `originalMask` matters
  // semantically: a dot here means "the sensor reported this value", whereas
  // the line between dots is a smooth fill, not raw measurement.
  const measurementDots = (() => {
    if (!hasReal) return [];
    const originals = real.points.filter((_, i) => real.originalMask[i]);
    if (originals.length === 0) return [];
    const step = Math.max(1, Math.ceil(originals.length / 6));
    const out = [];
    for (let i = 0; i < originals.length; i += step) out.push(originals[i]);
    const last = originals[originals.length - 1];
    if (out[out.length - 1] !== last) out.push(last);
    return out;
  })();

  const lastActual = hasReal ? real.points[real.points.length - 1] : null;
  const predTip = predicted.length > 1 ? predicted[predicted.length - 1] : null;

  // Build area fill polygons per segment (for the soft glow under the line).
  const areaForSeg = (seg) => seg.length === 0 ? '' :
    `${seg[0].x},${h - padding.b} ${polylineStr(seg)} ${seg[seg.length - 1].x},${h - padding.b}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="gluco-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-line)" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="var(--chart-line)" stopOpacity="0"/>
        </linearGradient>
        <pattern id="gap-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--chart-gap-line)" strokeWidth="1" opacity="0.5"/>
        </pattern>
      </defs>

      {/* Single uniform plot background — no horizontal zone tints. The user
          asked for a flat backdrop; threshold semantics now live only in the
          dashed 180/70 lines and their colored axis labels. */}
      {/* Future zone — neutral panel-tone band so "gerçek vs öngörülen"
          boundary reads without alarming the eye. Vertical-only, full height. */}
      {hasReal && predTip && (
        <rect x={nowX} y={padding.t} width={Math.max(0, predTip.x - nowX)} height={innerH}
              fill="var(--chart-line)" opacity="0.04"/>
      )}

      <ChartGrid width={w} height={h} padding={padding} xLabels={xLabels}/>

      {/* No-data gap bands — gray hatched fill plus dashed boundary lines so
          clinicians can immediately see "ring was offline here". */}
      {hasReal && real.gaps.map((g, i) => (
        <g key={`gap${i}`}>
          <rect x={g.xStart} y={padding.t} width={Math.max(0, g.xEnd - g.xStart)} height={innerH}
                fill="var(--chart-gap-fill)"/>
          <rect x={g.xStart} y={padding.t} width={Math.max(0, g.xEnd - g.xStart)} height={innerH}
                fill="url(#gap-hatch)" opacity="0.55"/>
          <line x1={g.xStart} x2={g.xStart} y1={padding.t} y2={h - padding.b}
                stroke="var(--chart-gap-line)" strokeDasharray="3 3" strokeWidth="1.25"/>
          <line x1={g.xEnd} x2={g.xEnd} y1={padding.t} y2={h - padding.b}
                stroke="var(--chart-gap-line)" strokeDasharray="3 3" strokeWidth="1.25"/>
          <text x={(g.xStart + g.xEnd) / 2} y={padding.t + 16}
                fill="var(--text-mute)" fontSize="12.5" fontFamily="JetBrains Mono"
                fontWeight="700" textAnchor="middle" letterSpacing="0.10em">
            VERİ YOK
          </text>
        </g>
      ))}

      {/* Actual line(s) — split per gap. Soft area fill underneath, solid line on top. */}
      {segments.map((seg, i) => seg.length >= 2 && (
        <g key={`seg${i}`}>
          {style !== 'candle' && (
            <polygon points={areaForSeg(seg)} fill="url(#gluco-area)"/>
          )}
          {style === 'candle' ? (
            seg.map((p, j) => {
              if (j % Math.max(1, Math.ceil(seg.length / 24)) !== 0) return null;
              const high = p.y - 8 - Math.abs(Math.sin(j * 0.7) * 4);
              const low = p.y + 8 + Math.abs(Math.cos(j * 0.5) * 4);
              const up = j % 2 === 0;
              return (
                <g key={`c${j}`}>
                  <line x1={p.x} x2={p.x} y1={high} y2={low}
                        stroke="var(--chart-line)" strokeWidth="1" opacity="0.6"/>
                  <rect x={p.x - 3} y={p.y - 5} width="6" height="10"
                        fill={up ? 'var(--chart-line)' : 'var(--m3-tertiary)'} opacity="0.85"/>
                </g>
              );
            })
          ) : (
            <polyline points={polylineStr(seg)} fill="none"
                      stroke="var(--chart-line)" strokeWidth="2"
                      strokeLinejoin="round" strokeLinecap="round"/>
          )}
        </g>
      ))}

      {/* Predicted continuation — same chart-line color, dashed and faded.
          Visually unmistakable as future data, not a separate alarm. */}
      {predicted.length > 1 && (
        <polyline
          points={polylineStr(predicted)}
          fill="none"
          stroke="var(--chart-line)"
          strokeWidth="1.75"
          strokeDasharray="6 4"
          strokeLinecap="round"
          opacity="0.65"/>
      )}

      {/* Measurement dots — only on original sensor readings, max 6, hollow
          circles so they read as markers rather than nodes. */}
      {measurementDots.map((p, i) => (
        <circle key={`d${i}`} cx={p.x} cy={p.y} r="3"
                fill="var(--panel, #fff)" stroke="var(--chart-line)" strokeWidth="1.5"/>
      ))}

      {/* "Şimdi" vertical line — accent red, the one place red still belongs.
          It is the focal point: where actual ends and prediction begins. */}
      <line x1={nowX} x2={nowX} y1={padding.t} y2={h - padding.b}
            stroke="var(--accent)" strokeDasharray="2 4" opacity="0.7" strokeWidth="1.4"/>
      <g transform={`translate(${nowX}, ${padding.t - 18})`}>
        <rect x="-30" y="0" width="60" height="18" rx="4" fill="var(--accent)"/>
        <text x="0" y="13" fill="var(--on-accent, #fff)" fontSize="12" fontFamily="JetBrains Mono"
              fontWeight="700" textAnchor="middle" letterSpacing="0.12em">ŞİMDİ</text>
      </g>

      {/* Last actual sample — value badge in chart-line color. */}
      {hasReal && lastActual && (() => {
        const labelY = Math.max(padding.t + 30, lastActual.y - 22);
        const labelX = Math.max(padding.l + 36, lastActual.x - 38);
        return (
          <g>
            <circle cx={lastActual.x} cy={lastActual.y} r="9" fill="var(--chart-line)" opacity="0.20"/>
            <circle cx={lastActual.x} cy={lastActual.y} r="5" fill="var(--chart-line)"/>
            <g transform={`translate(${labelX - 36}, ${labelY})`}>
              <rect x="0" y="0" width="78" height="26" rx="5"
                    fill="var(--panel, #fff)" stroke="var(--chart-line)" strokeWidth="1.5"/>
              <text x="39" y="17" fill="var(--chart-line)" fontSize="13.5" fontFamily="JetBrains Mono"
                    fontWeight="700" textAnchor="middle" letterSpacing="0.04em">
                {Math.round(lastActual.g)} mg/dL
              </text>
            </g>
          </g>
        );
      })()}

      {/* Predicted tip — dashed badge, same chart-line color, lower opacity */}
      {hasReal && predTip && (() => {
        const labelY = Math.max(padding.t + 30, predTip.y - 28);
        const labelX = Math.min(w - padding.r - 100, predTip.x - 50);
        return (
          <g opacity="0.95">
            <circle cx={predTip.x} cy={predTip.y} r="4" fill="var(--chart-line)" opacity="0.7"/>
            <g transform={`translate(${labelX}, ${labelY})`}>
              <rect x="0" y="0" width="100" height="26" rx="5"
                    fill="var(--panel, #fff)" stroke="var(--chart-line)" strokeWidth="1.25"
                    strokeDasharray="3 2"/>
              <text x="50" y="17" fill="var(--chart-line)" fontSize="13" fontFamily="JetBrains Mono"
                    fontWeight="700" textAnchor="middle" letterSpacing="0.04em">
                +{horizon}dk · {Math.round(predTip.g)}
              </text>
            </g>
          </g>
        );
      })()}

      {/* TAHMİN label — centered inside the future zone (between ŞİMDİ pill
          and the predicted tip) so it never collides with the ŞİMDİ marker.
          GERÇEK VERİ label removed: the line itself is the obvious indicator. */}
      {hasReal && predTip && (
        <text x={(nowX + predTip.x) / 2} y={padding.t - 10}
              fill="var(--text-mute)" fontSize="12" fontFamily="JetBrains Mono"
              fontWeight="700" textAnchor="middle" letterSpacing="0.16em">
          TAHMİN
        </text>
      )}
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
