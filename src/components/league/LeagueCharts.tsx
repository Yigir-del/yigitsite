import type { ChampionStat, LeagueMatch } from '../../types/league';

interface LeagueChartsProps {
  matches: LeagueMatch[];
  championStats: ChampionStat[];
  embedded?: boolean;
}

interface ChartPoint {
  label: string;
  value: number;
  display?: string;
  color?: string;
}

interface SvgLineChartProps {
  title: string;
  subtitle: string;
  points: ChartPoint[];
  yMin: number;
  yMax: number;
  yTickLabels?: string[];
  unit?: string;
  variant?: 'line' | 'step' | 'bar-labeled';
}

const CHART_W = 320;
const CHART_H = 140;
const PAD = { top: 16, right: 12, bottom: 28, left: 36 };

function SvgLineChart({
  title,
  subtitle,
  points,
  yMin,
  yMax,
  yTickLabels,
  unit = '',
  variant = 'line',
}: SvgLineChartProps) {
  if (points.length === 0) return null;

  const innerW = CHART_W - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;
  const range = yMax - yMin || 1;

  const coords = points.map((p, i) => {
    const x = PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
    const y = PAD.top + innerH - ((p.value - yMin) / range) * innerH;
    return { ...p, x, y };
  });

  const linePath = coords
    .map((c, i) => {
      if (variant === 'step' && i > 0) {
        return `H ${c.x} V ${c.y}`;
      }
      return `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`;
    })
    .join(' ');

  const yTicks = yTickLabels ?? [String(yMax), String(Math.round((yMax + yMin) / 2)), String(yMin)];

  return (
    <div className="league-chart-card card-surface">
      <h4>{title}</h4>
      <p className="league-stat-sublabel">{subtitle}</p>
      <svg
        className="league-line-chart"
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        role="img"
        aria-label={`${title}: ${points.map((p) => `${p.label} ${p.display ?? p.value}`).join(', ')}`}
      >
        {[0, 0.5, 1].map((t) => {
          const y = PAD.top + innerH * (1 - t);
          return (
            <g key={t}>
              <line
                x1={PAD.left}
                y1={y}
                x2={CHART_W - PAD.right}
                y2={y}
                className="league-line-chart__grid"
              />
              <text x={PAD.left - 6} y={y + 3} className="league-line-chart__axis-y" textAnchor="end">
                {yTicks[Math.round(t * 2)] ?? ''}
              </text>
            </g>
          );
        })}

        {variant !== 'bar-labeled' && coords.length > 1 && (
          <path d={linePath} className="league-line-chart__line" fill="none" />
        )}

        {coords.map((c) =>
          variant === 'bar-labeled' ? (
            <g key={c.label}>
              <rect
                x={c.x - 14}
                y={c.y}
                width={28}
                height={PAD.top + innerH - c.y}
                className="league-line-chart__bar"
                rx={3}
              />
              <text x={c.x} y={c.y - 6} className="league-line-chart__value" textAnchor="middle">
                {c.display ?? `${c.value}${unit}`}
              </text>
              <text x={c.x} y={CHART_H - 6} className="league-line-chart__axis-x" textAnchor="middle">
                {c.label}
              </text>
            </g>
          ) : (
            <g key={c.label}>
              <circle
                cx={c.x}
                cy={c.y}
                r={5}
                className="league-line-chart__dot"
                style={c.color ? { fill: c.color, stroke: c.color } : undefined}
              />
              <text x={c.x} y={c.y - 10} className="league-line-chart__value" textAnchor="middle">
                {c.display ?? `${c.value}${unit}`}
              </text>
              <text x={c.x} y={CHART_H - 6} className="league-line-chart__axis-x" textAnchor="middle">
                {c.label}
              </text>
            </g>
          ),
        )}
      </svg>
    </div>
  );
}

export default function LeagueCharts({ matches, championStats, embedded }: LeagueChartsProps) {
  const chronological = [...matches].reverse();
  const recentResults = chronological.slice(-10);
  const kdaTrend = chronological.slice(-10);
  const topChamps = championStats.slice(0, 5);

  if (recentResults.length === 0) return null;

  const resultPoints: ChartPoint[] = recentResults.map((m, i) => ({
    label: `${i + 1}`,
    value: m.win ? 1 : 0,
    display: m.win ? 'W' : 'L',
    color: m.win ? '#4ade80' : '#f87171',
  }));

  const kdaPoints: ChartPoint[] = kdaTrend.map((m, i) => {
    const kda = (m.kills + m.assists) / Math.max(m.deaths, 1);
    return {
      label: `${i + 1}`,
      value: kda,
      display: kda.toFixed(1),
    };
  });

  const kdaMax = Math.max(...kdaPoints.map((p) => p.value), 3);

  const champPoints: ChartPoint[] = topChamps.map((c) => ({
    label: c.championName.slice(0, 4),
    value: c.winRate * 100,
    display: `${Math.round(c.winRate * 100)}%`,
  }));

  return (
    <div className={`league-charts-wrap${embedded ? ' league-charts-wrap--embedded' : ''}`}>
      {!embedded && <h3 className="league-section-title">Performance Trends</h3>}
      <div className="league-charts">
        <SvgLineChart
          title="Recent Results"
          subtitle="Son maçlar — W = Win, L = Loss"
          points={resultPoints}
          yMin={0}
          yMax={1}
          yTickLabels={['Loss', '', 'Win']}
          variant="step"
        />

        <SvgLineChart
          title="KDA Trend"
          subtitle="Son maçlar — KDA oranı"
          points={kdaPoints}
          yMin={0}
          yMax={Math.ceil(kdaMax * 1.1)}
          unit=""
          variant="line"
        />

        {champPoints.length > 0 && (
          <SvgLineChart
            title="Champion Win Rate"
            subtitle="En çok oynanan — % win rate"
            points={champPoints}
            yMin={0}
            yMax={100}
            yTickLabels={['0%', '50%', '100%']}
            unit="%"
            variant="bar-labeled"
          />
        )}
      </div>
    </div>
  );
}
