import { useState } from 'react';

type Pt = [number, number];

function scaleX(x: number, xMin: number, xMax: number, cW: number) {
  return ((x - xMin) / (xMax - xMin)) * cW;
}
function scaleY(y: number, yMin: number, yMax: number, cH: number) {
  return cH - ((y - yMin) / (yMax - yMin)) * cH;
}
function pointsToPath(pts: Pt[], xMin: number, xMax: number, yMin: number, yMax: number, cW: number, cH: number) {
  return pts
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${scaleX(x, xMin, xMax, cW).toFixed(1)} ${scaleY(y, yMin, yMax, cH).toFixed(1)}`)
    .join(' ');
}

interface Item {
  id: string;
  ppm: string;
  era: string;
  title: string;
  desc: string;
  badge: string;
  short: string;
  dot: string;
}

interface Marker {
  i: number;
  x: number;
  ppm: number;
  color: string;
  label: string;
}

function ppmColor(dot: string) {
  if (dot === 'danger') return 'var(--danger)';
  if (dot === 'amber') return 'var(--amber)';
  return 'var(--teal)';
}

function TLSparkline({
  active,
  onSelect,
  points,
  markers,
}: {
  active: number;
  onSelect: (i: number) => void;
  points: Pt[];
  markers: Marker[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 820, H = 100;
  const xMin = -800000, xMax = 2100, yMin = 150, yMax = 470;

  const path = pointsToPath(points, xMin, xMax, yMin, yMax, W, H - 20);
  const areaPath = path + ` L${W} ${H - 20} L0 ${H - 20} Z`;

  const circles = markers.map((m) => {
    let x: number;
    if (m.i === 1) {
      x = scaleX(0, xMin, xMax, W) * 0.7 + 20;
    } else {
      x = scaleX(m.x, xMin, xMax, W);
    }
    const yPpm = m.i === 0 ? 200 : m.i === 1 ? 280 : m.i === 2 ? 285 : m.i === 3 ? 340 : 425;
    return { x, y: scaleY(yPpm, yMin, yMax, H - 20), color: m.color, i: m.i, label: m.label, ppm: yPpm };
  });

  const hoverC = hovered !== null ? circles.find((c) => c.i === hovered) : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block', cursor: 'pointer' }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3fbcaa" stopOpacity="0.15" />
          <stop offset="85%" stopColor="#3fbcaa" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#d45f5f" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkGrad)" />
      <path d={path} fill="none" stroke="#3fbcaa" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      {circles.map((c) => (
        <g key={c.i} onClick={() => onSelect(c.i)} onMouseEnter={() => setHovered(c.i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
          <circle cx={c.x} cy={c.y} r={28} fill="transparent" />
          <circle
            cx={c.x}
            cy={c.y}
            r={active === c.i ? 9 : hovered === c.i ? 8 : 6}
            fill={c.color}
            opacity={active === c.i ? 1 : hovered === c.i ? 0.85 : 0.6}
            style={{ transition: 'r 0.25s ease, opacity 0.25s ease, fill 0.3s ease' }}
          />
          {active === c.i && <circle cx={c.x} cy={c.y} r={14} fill="none" stroke={c.color} strokeWidth={1.5} opacity={0.4} />}
        </g>
      ))}
      {circles.map((c) => (
        <text
          key={`l-${c.i}`}
          x={c.x}
          y={H - 2}
          textAnchor="middle"
          fill={active === c.i ? 'var(--text)' : 'rgba(138,170,144,0.5)'}
          fontSize={9}
          fontFamily="DM Mono,monospace"
          style={{ transition: 'fill 0.2s' }}
        >
          {c.label}
        </text>
      ))}
      {hoverC && (
        <g transform={`translate(${Math.min(hoverC.x + 14, W - 130)},${Math.max(hoverC.y - 38, 4)})`} style={{ pointerEvents: 'none' }}>
          <rect x={0} y={0} width={120} height={32} rx={6} fill="rgba(17,31,21,0.97)" stroke={hoverC.color} strokeOpacity={0.4} strokeWidth={1} />
          <text x={8} y={13} fill="rgba(200,220,205,0.85)" fontSize={9} fontFamily="DM Sans,sans-serif">{hoverC.label}</text>
          <text x={8} y={26} fill={hoverC.color} fontSize={10} fontFamily="DM Mono,monospace" fontWeight="500">~{hoverC.ppm} ppm</text>
        </g>
      )}
    </svg>
  );
}

export function TimelineViz({
  items,
  defaultIndex = 4,
  sparklinePoints,
  markers,
  header,
}: {
  items: Item[];
  defaultIndex?: number;
  sparklinePoints: Pt[];
  markers: Marker[];
  header: string;
}) {
  const [active, setActive] = useState(defaultIndex);
  const cur = items[active];

  return (
    <div style={{ marginTop: '2.5rem' }}>
      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-m)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
            marginBottom: '0.75rem',
          }}
        >
          {header}
        </div>
        <TLSparkline active={active} onSelect={setActive} points={sparklinePoints} markers={markers} />
      </div>
      {cur && (
        <div
          key={active}
          style={{
            background: 'var(--bg2)',
            border: `1px solid ${ppmColor(cur.dot)}40`,
            borderRadius: '16px',
            padding: '2rem',
            transition: 'border-color 0.4s ease, background 0.4s ease',
            animation: 'tl-fade 0.4s ease',
          }}
        >
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 auto' }}>
              <div
                style={{
                  fontFamily: 'var(--font-m)',
                  fontSize: '2.5rem',
                  fontWeight: 500,
                  color: ppmColor(cur.dot),
                  lineHeight: 1,
                }}
              >
                {cur.ppm}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-m)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-dim)',
                  marginTop: '0.35rem',
                }}
              >
                {cur.era}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.6rem' }}>
                {cur.title}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{cur.desc}</p>
              <div
                style={{
                  display: 'inline-flex',
                  marginTop: '1rem',
                  background: `${ppmColor(cur.dot)}18`,
                  color: ppmColor(cur.dot),
                  border: `1px solid ${ppmColor(cur.dot)}30`,
                  borderRadius: '100px',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-m)',
                  letterSpacing: '0.08em',
                }}
              >
                {cur.badge}
              </div>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              background: active === i ? ppmColor(item.dot) + '22' : 'var(--bg2)',
              border: `1px solid ${active === i ? ppmColor(item.dot) + '50' : 'var(--border)'}`,
              color: active === i ? ppmColor(item.dot) : 'var(--text-muted)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-m)',
              transition: 'all 0.25s ease',
              textAlign: 'left',
              transform: active === i ? 'translateY(-1px)' : 'none',
            }}
          >
            <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.15rem' }}>{i + 1}</div>
            {item.short}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TimelineViz;
