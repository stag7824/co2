import { useState } from 'react';

interface Item {
  ppm: number;
  temp: number;
  color: string;
  year: string;
  impacts: string[];
}

interface Labels {
  estTempRise: string;
  abovePreindustrial: string;
  at: string;
  globalTempRise: string;
  approxTimeline: string;
  footnote: string;
}

export function ImpactPredictor({
  items,
  defaultIndex = 2,
  labels,
}: {
  items: Item[];
  defaultIndex?: number;
  labels: Labels;
}) {
  const [idx, setIdx] = useState(defaultIndex);
  const d = items[idx];
  const gaugePos = (idx / (items.length - 1)) * 100;
  const tempColor = d.color;
  const borderColor = d.color + '40';

  return (
    <div className="predictor-inner">
      <div className="predictor-slider-wrap">
        <div className="slider-label">
          <div>
            <div className="slider-ppm" style={{ color: d.color, transition: 'color 0.4s ease' }}>
              {d.ppm} <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>ppm</span>
            </div>
            <div className="slider-desc" style={{ transition: 'opacity 0.3s ease' }}>{d.year}</div>
          </div>
        </div>
        <div>
          <div className="gauge-bar">
            <div className="gauge-thumb" style={{ left: gaugePos + '%', background: d.color, transition: 'left 0.45s cubic-bezier(0.22, 1, 0.36, 1), background 0.35s ease' }}></div>
          </div>
          <input
            type="range"
            min={0}
            max={items.length - 1}
            step={1}
            value={idx}
            style={{ ['--thumb-color' as string]: d.color } as React.CSSProperties}
            onChange={(e) => setIdx(Number(e.target.value))}
          />
          <div className="slider-marks">
            {items.map((p, i) => (
              <span key={i}>{p.ppm}</span>
            ))}
          </div>
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-dim)',
              marginBottom: '0.75rem',
              fontFamily: 'var(--font-m)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {labels.estTempRise}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-m)',
                fontSize: '3.5rem',
                fontWeight: 500,
                color: d.color,
                lineHeight: 1,
                transition: 'color 0.45s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              +{d.temp.toFixed(1)}
            </span>
            <span style={{ fontFamily: 'var(--font-m)', fontSize: '1.5rem', color: 'var(--text-muted)' }}>°C</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginLeft: '0.5rem' }}>{labels.abovePreindustrial}</span>
          </div>
          <div
            style={{
              height: '4px',
              borderRadius: '100px',
              background: `linear-gradient(90deg, var(--teal), var(--amber), var(--danger))`,
              marginTop: '1rem',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-4px',
                left: `${Math.min((d.temp / 7) * 100, 98)}%`,
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: d.color,
                border: '2px solid var(--bg)',
                transform: 'translateX(-50%)',
                transition: 'left 0.5s cubic-bezier(0.22, 1, 0.36, 1), background 0.35s ease',
              }}
            ></div>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: 'var(--text-dim)',
              marginTop: '0.4rem',
              fontFamily: 'var(--font-m)',
            }}
          >
            <span>0°C</span>
            <span>2°C</span>
            <span>4°C</span>
            <span>7°C+</span>
          </div>
        </div>
        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-dim)',
            lineHeight: 1.6,
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'rgba(26,51,33,0.4)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
          }}
        >
          {labels.footnote}
        </div>
      </div>
      <div className="predictor-result" style={{ borderColor, transition: 'border-color 0.4s ease' }}>
        <div
          style={{
            fontFamily: 'var(--font-m)',
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
            marginBottom: '0.5rem',
          }}
        >
          {labels.at} {d.ppm} ppm
        </div>
        <div className="result-temp" style={{ color: tempColor, transition: 'color 0.45s ease' }}>+{d.temp.toFixed(1)}°C</div>
        <div className="result-temp-label">{labels.globalTempRise}</div>
        <div className="result-divider"></div>
        <div className="result-impacts" key={idx} style={{ animation: 'predictor-fade 0.4s ease' }}>
          {d.impacts.map((imp, i) => (
            <div key={i} className="impact-item">
              <span className="impact-icon" style={{ color: d.color, transition: 'color 0.4s ease' }}>→</span>
              <span>{imp}</span>
            </div>
          ))}
        </div>
        <div className="result-year">📅 {labels.approxTimeline}: {d.year}</div>
      </div>
    </div>
  );
}

export default ImpactPredictor;
