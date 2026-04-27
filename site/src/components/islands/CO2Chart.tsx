import { useState, useRef, type MouseEvent } from 'react';
import data from '../../data/co2-data.json';

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

const historicalCO2 = data.historical as Pt[];
const iceCore = data.iceCore as Pt[];
const refLinesData = data.refLines as { ppm: number; labelKey: string; color: string }[];

type Scenario = { id: string; labelKey: string; color: string; dash: string; points: Pt[] };
const scenarios = data.scenarios as Scenario[];

interface IndustrialLabels {
  title: string;
  subtitle: string;
  legendHistorical: string;
  legendNote: string;
  legendHidden: string;
  axisLabel: string;
  now: string;
  scenarioBau: string;
  scenarioModerate: string;
  scenarioStrong: string;
  refPreindustrial: string;
  refToday: string;
  refDouble: string;
}

interface Tooltip {
  year: number;
  rows: { label: string; val: string; color: string }[];
  x: number;
  y: number;
}

function scenarioLabel(id: string, l: IndustrialLabels): string {
  if (id === 'bau') return l.scenarioBau;
  if (id === 'moderate') return l.scenarioModerate;
  if (id === 'strong') return l.scenarioStrong;
  return id;
}

function refLabel(idx: number, l: IndustrialLabels): string {
  if (idx === 0) return l.refPreindustrial;
  if (idx === 1) return l.refToday;
  return l.refDouble;
}

export function CO2Chart({ labels }: { labels: IndustrialLabels }) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const svgRef = useRef<SVGSVGElement | null>(null);
  const W = 860, H = 360, PAD = { t: 20, r: 20, b: 50, l: 60 };
  const cW = W - PAD.l - PAD.r, cH = H - PAD.t - PAD.b;
  const xMin = 1750, xMax = 2100, yMin = 240, yMax = 950;

  const histPath = pointsToPath(historicalCO2, xMin, xMax, yMin, yMax, cW, cH);
  const areaPath =
    histPath +
    ` L${scaleX(2025, xMin, xMax, cW).toFixed(1)} ${cH} L${scaleX(1750, xMin, xMax, cW).toFixed(1)} ${cH} Z`;

  const yTicks = [280, 350, 425, 500, 600, 700, 800, 900];
  const xTicks = [1800, 1850, 1900, 1950, 2000, 2025, 2050, 2100];

  function handleMouseMove(e: MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scale = W / rect.width;
    const mx = (e.clientX - rect.left) * scale - PAD.l;
    const year = Math.round((mx / cW) * (xMax - xMin) + xMin);
    if (year < xMin || year > xMax) {
      setTooltip(null);
      return;
    }
    const rows: Tooltip['rows'] = [];
    const hIdx = historicalCO2.findIndex((p) => p[0] >= year);
    if (hIdx > 0 && year <= 2025) {
      const [y0, v0] = historicalCO2[hIdx - 1];
      const [y1, v1] = historicalCO2[hIdx];
      const t = (year - y0) / (y1 - y0);
      rows.push({ label: labels.legendHistorical, val: (v0 + t * (v1 - v0)).toFixed(1) + ' ppm', color: '#7ec992' });
    }
    if (year >= 2025) {
      scenarios.forEach((sc) => {
        if (hidden[sc.id]) return;
        const idx = sc.points.findIndex((p) => p[0] >= year);
        if (idx > 0) {
          const [y0, v0] = sc.points[idx - 1];
          const [y1, v1] = sc.points[idx];
          const t = (year - y0) / (y1 - y0);
          rows.push({ label: scenarioLabel(sc.id, labels), val: (v0 + t * (v1 - v0)).toFixed(1) + ' ppm', color: sc.color });
        } else if (idx === 0) {
          rows.push({ label: scenarioLabel(sc.id, labels), val: sc.points[0][1] + ' ppm', color: sc.color });
        }
      });
    }
    const tx = Math.min(mx + PAD.l + 12, W - 290);
    setTooltip({ year, rows, x: tx, y: 20 });
  }

  return (
    <div className="chart-wrap">
      <div className="chart-title">{labels.title}</div>
      <div className="chart-subtitle">{labels.subtitle}</div>
      <div style={{ overflowX: 'auto' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', minWidth: 320, display: 'block', cursor: 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5aab6e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#5aab6e" stopOpacity="0.03" />
            </linearGradient>
            <clipPath id="chartClip">
              <rect x="0" y="0" width={cW} height={cH} />
            </clipPath>
          </defs>
          <g transform={`translate(${PAD.l},${PAD.t})`}>
            {yTicks.map((ppm) => (
              <line key={ppm} x1={0} y1={scaleY(ppm, yMin, yMax, cH)} x2={cW} y2={scaleY(ppm, yMin, yMax, cH)} stroke="rgba(120,180,130,0.08)" strokeWidth={1} />
            ))}
            {xTicks.map((yr) => (
              <line key={yr} x1={scaleX(yr, xMin, xMax, cW)} y1={0} x2={scaleX(yr, xMin, xMax, cW)} y2={cH} stroke="rgba(120,180,130,0.08)" strokeWidth={1} />
            ))}
            {refLinesData.map((r, i) => {
              const y = scaleY(r.ppm, yMin, yMax, cH);
              return (
                <g key={r.ppm}>
                  <line x1={0} y1={y} x2={cW} y2={y} stroke={r.color} strokeWidth={1} strokeDasharray="3,4" />
                  <text x={4} y={y - 5} fill={r.color} fontSize={9} fontFamily="DM Mono,monospace">{refLabel(i, labels)}</text>
                </g>
              );
            })}
            <line x1={scaleX(2025, xMin, xMax, cW)} y1={0} x2={scaleX(2025, xMin, xMax, cW)} y2={cH} stroke="rgba(201,168,76,0.4)" strokeWidth={1} strokeDasharray="2,3" />
            <text x={scaleX(2025, xMin, xMax, cW) + 4} y={14} fill="rgba(201,168,76,0.7)" fontSize={9} fontFamily="DM Mono,monospace">▼ {labels.now}</text>
            <g clipPath="url(#chartClip)">
              <path d={areaPath} fill="url(#areaGrad)" />
              <path d={histPath} fill="none" stroke="#5aab6e" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {scenarios.map((sc) => !hidden[sc.id] && (
                <path key={sc.id} d={pointsToPath(sc.points, xMin, xMax, yMin, yMax, cW, cH)} fill="none" stroke={sc.color} strokeWidth={2} strokeDasharray={sc.dash} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} style={{ transition: 'opacity 0.35s ease, stroke-width 0.2s ease' }} />
              ))}
            </g>
            {yTicks.map((ppm) => (
              <text key={ppm} x={-8} y={scaleY(ppm, yMin, yMax, cH) + 4} textAnchor="end" fill="rgba(138,170,144,0.7)" fontSize={10} fontFamily="DM Mono,monospace">{ppm}</text>
            ))}
            {xTicks.map((yr) => (
              <text key={yr} x={scaleX(yr, xMin, xMax, cW)} y={cH + 18} textAnchor="middle" fill="rgba(138,170,144,0.7)" fontSize={10} fontFamily="DM Mono,monospace">{yr}</text>
            ))}
            <text x={-35} y={cH / 2} textAnchor="middle" transform={`rotate(-90,-35,${cH / 2})`} fill="rgba(138,170,144,0.5)" fontSize={10} fontFamily="DM Mono,monospace">{labels.axisLabel}</text>
            {tooltip && tooltip.rows.length > 0 && (
              <g transform={`translate(${tooltip.x - PAD.l},${tooltip.y})`} style={{ pointerEvents: 'none' }}>
                <rect x={0} y={0} width={280} height={tooltip.rows.length * 22 + 30} rx={8} fill="rgba(17,31,21,0.97)" stroke="rgba(120,180,130,0.3)" strokeWidth={1} />
                <text x={10} y={18} fill="rgba(138,170,144,0.7)" fontSize={9} fontFamily="DM Mono,monospace" letterSpacing="0.1em">{tooltip.year}</text>
                {tooltip.rows.map((r, i) => (
                  <g key={i} transform={`translate(0,${i * 22 + 26})`}>
                    <circle cx={10} cy={5} r={4} fill={r.color} />
                    <text x={20} y={9} fill="#e8f0e9" fontSize={10} fontFamily="DM Mono,monospace" fontWeight="500">{r.val}</text>
                    <text x={92} y={9} fill="rgba(200,220,205,0.85)" fontSize={9} fontFamily="DM Sans,sans-serif">{r.label.length > 32 ? r.label.slice(0, 30) + '…' : r.label}</text>
                  </g>
                ))}
              </g>
            )}
          </g>
        </svg>
      </div>
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#5aab6e' }}></div>
          <span>{labels.legendHistorical}</span>
        </div>
        {scenarios.map((sc) => (
          <div
            key={sc.id}
            className="legend-item"
            style={{ opacity: hidden[sc.id] ? 0.35 : 1, cursor: 'pointer', transition: 'opacity 0.25s ease' }}
            onClick={() => setHidden((h) => ({ ...h, [sc.id]: !h[sc.id] }))}
          >
            <div
              className="legend-dot"
              style={{
                background: sc.color,
                opacity: sc.dash ? 0.8 : 1,
                backgroundImage: sc.dash
                  ? `repeating-linear-gradient(90deg, ${sc.color} 0px, ${sc.color} 6px, transparent 6px, transparent 10px)`
                  : '',
              }}
            ></div>
            <span>{scenarioLabel(sc.id, labels)} {hidden[sc.id] ? labels.legendHidden : ''}</span>
          </div>
        ))}
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>{labels.legendNote}</span>
      </div>
    </div>
  );
}

interface IceLabels {
  title: string;
  subtitle: string;
  naturalRange: string;
  industrialSpike: string;
}

export function IceCoreChart({ labels }: { labels: IceLabels }) {
  const [hover, setHover] = useState<{ year: number; ppm: number; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const W = 860, H = 180, PAD = { t: 15, r: 20, b: 35, l: 55 };
  const cW = W - PAD.l - PAD.r, cH = H - PAD.t - PAD.b;
  const allPts: Pt[] = [...iceCore, [1750, 280], [2025, 425]];
  const xMin = -800000, xMax = 2025, yMin = 155, yMax = 450;
  const histPath = pointsToPath(allPts, xMin, xMax, yMin, yMax, cW, cH);
  const areaPath = histPath + ` L${scaleX(2025, xMin, xMax, cW).toFixed(1)} ${cH} L0 ${cH} Z`;
  const xLabels: [number, string][] = [
    [-800000, '800k BCE'], [-600000, '600k'], [-400000, '400k'],
    [-200000, '200k'], [-50000, '50k'], [0, '0'], [2025, 'Now'],
  ];

  function fmtYear(y: number): string {
    if (y < -1000) return `${Math.round(-y / 1000)}k BCE`;
    if (y < 0) return `${-y} BCE`;
    if (y < 1000) return `${y} CE`;
    return `${y}`;
  }

  function handleMove(e: MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scale = W / rect.width;
    const mx = (e.clientX - rect.left) * scale - PAD.l;
    if (mx < 0 || mx > cW) { setHover(null); return; }
    const year = Math.round((mx / cW) * (xMax - xMin) + xMin);
    const idx = allPts.findIndex((p) => p[0] >= year);
    let ppm: number;
    if (idx <= 0) ppm = allPts[0][1];
    else {
      const [y0, v0] = allPts[idx - 1];
      const [y1, v1] = allPts[idx];
      const tt = (year - y0) / (y1 - y0);
      ppm = v0 + tt * (v1 - v0);
    }
    setHover({ year, ppm, x: Math.min(mx + PAD.l + 12, W - 200), y: 10 });
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 300, display: 'block', cursor: 'crosshair' }}
        onMouseMove={handleMove} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="iceGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3fbcaa" stopOpacity="0.12" />
            <stop offset="90%" stopColor="#3fbcaa" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#d45f5f" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <g transform={`translate(${PAD.l},${PAD.t})`}>
          {[180, 220, 260, 300, 340, 380, 420].map((p) => (
            <g key={p}>
              <line x1={0} y1={scaleY(p, yMin, yMax, cH)} x2={cW} y2={scaleY(p, yMin, yMax, cH)} stroke="rgba(120,180,130,0.07)" strokeWidth={1} />
              <text x={-8} y={scaleY(p, yMin, yMax, cH) + 4} textAnchor="end" fill="rgba(138,170,144,0.6)" fontSize={9} fontFamily="DM Mono,monospace">{p}</text>
            </g>
          ))}
          <path d={areaPath} fill="url(#iceGrad)" />
          <path d={histPath} fill="none" stroke="#3fbcaa" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
          <line x1={scaleX(1750, xMin, xMax, cW)} y1={0} x2={scaleX(1750, xMin, xMax, cW)} y2={cH} stroke="rgba(201,168,76,0.5)" strokeWidth={1} strokeDasharray="2,3" />
          <circle cx={scaleX(2025, xMin, xMax, cW)} cy={scaleY(425, yMin, yMax, cH)} r={4} fill="#d45f5f" />
          <text x={scaleX(2025, xMin, xMax, cW) - 4} y={scaleY(425, yMin, yMax, cH) - 8} textAnchor="end" fill="#d45f5f" fontSize={9} fontFamily="DM Mono,monospace" fontWeight="500">425 ppm</text>
          {xLabels.map(([yr, label]) => (
            <text key={yr} x={scaleX(yr, xMin, xMax, cW)} y={cH + 16} textAnchor="middle" fill="rgba(138,170,144,0.6)" fontSize={9} fontFamily="DM Mono,monospace">{label}</text>
          ))}
          <text x={-35} y={cH / 2} textAnchor="middle" transform={`rotate(-90,-35,${cH / 2})`} fill="rgba(138,170,144,0.5)" fontSize={9} fontFamily="DM Mono,monospace">CO₂ ppm</text>
          <text x={10} y={15} fill="rgba(63,188,170,0.6)" fontSize={9} fontFamily="DM Mono,monospace">{labels.naturalRange}</text>
          <rect x={cW - 160} y={5} width={155} height={22} rx={4} fill="rgba(212,95,95,0.1)" stroke="rgba(212,95,95,0.3)" strokeWidth={1} />
          <text x={cW - 152} y={20} fill="#d45f5f" fontSize={9} fontFamily="DM Mono,monospace">{labels.industrialSpike}</text>
          {hover && (
            <g transform={`translate(${hover.x - PAD.l},${hover.y})`} style={{ pointerEvents: 'none' }}>
              <rect x={0} y={0} width={170} height={42} rx={8} fill="rgba(17,31,21,0.97)" stroke="rgba(120,180,130,0.3)" strokeWidth={1} />
              <text x={10} y={16} fill="rgba(138,170,144,0.75)" fontSize={9} fontFamily="DM Mono,monospace" letterSpacing="0.08em">{fmtYear(hover.year)}</text>
              <text x={10} y={32} fill="#3fbcaa" fontSize={11} fontFamily="DM Mono,monospace" fontWeight="500">{hover.ppm.toFixed(1)} ppm</text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

export default CO2Chart;
