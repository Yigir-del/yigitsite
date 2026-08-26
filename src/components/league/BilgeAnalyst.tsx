import type { PlayerStateAnalysis } from '../../types/league';
import {
  aggressionBandLabel,
  stateDisplayMeta,
} from '../../utils/playerStateDisplay';
import { BilgeLoLMaster } from './BilgeLoLMaster';

interface BilgeAnalystProps {
  analysis: PlayerStateAnalysis;
}

function ScoreBar({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="league-bilge__score">
      <div className="league-bilge__score-head">
        <span className="league-bilge__score-label">{label}</span>
        <span className="league-bilge__score-value">{value}/100</span>
      </div>
      <div className="league-bilge__score-track" aria-hidden>
        <div
          className="league-bilge__score-fill"
          style={{
            width: `${value}%`,
            background: accent ?? 'var(--accent-pale-gray)',
          }}
        />
      </div>
    </div>
  );
}

export default function BilgeAnalyst({ analysis }: BilgeAnalystProps) {
  const meta = stateDisplayMeta(analysis.state);
  const bandLabel = aggressionBandLabel(analysis.aggressionBand);

  const trendClass =
    analysis.playstyleTrend === 'MORE_AGGRESSIVE'
      ? 'league-bilge__trend--up'
      : analysis.playstyleTrend === 'MORE_CONTROLLED'
        ? 'league-bilge__trend--down'
        : 'league-bilge__trend--flat';

  return (
    <aside
      className="league-bilge-analyst"
      aria-label="Bilge'nin oyuncu durumu analizi"
    >
      <div className="league-bilge-analyst__scene">
        <BilgeLoLMaster state={analysis.state} />
      </div>

      <div className="league-bilge-analyst__panel">
        <p className="league-bilge-analyst__eyebrow">Bilge&apos;nin Gözlemi</p>

        <div className="league-bilge-analyst__state-row">
          <span className="league-bilge-analyst__state-emoji" aria-hidden>
            {meta.emoji}
          </span>
          <h2 className="league-bilge-analyst__state">{meta.label}</h2>
        </div>

        <p className="league-bilge-analyst__sub">
          {analysis.secondaryTendency
            ? `${bandLabel} · ${analysis.secondaryTendency}`
            : bandLabel}
        </p>

        <blockquote className="league-bilge-analyst__quote">
          {analysis.observation}
        </blockquote>

        <div className="league-bilge-analyst__scores">
          <ScoreBar
            label="Aggression"
            value={analysis.aggressionScore}
            accent={
              analysis.aggressionScore >= 61
                ? 'rgba(248, 113, 113, 0.85)'
                : analysis.aggressionScore <= 45
                  ? 'rgba(125, 211, 252, 0.85)'
                  : 'rgba(148, 163, 184, 0.85)'
            }
          />
          <ScoreBar
            label="Momentum"
            value={analysis.momentumScore}
            accent="rgba(251, 191, 36, 0.85)"
          />
          <ScoreBar
            label="Consistency"
            value={analysis.consistencyScore}
            accent="rgba(134, 239, 172, 0.75)"
          />
        </div>

        <div className="league-bilge-analyst__trend">
          <p className="league-stat-label">Playstyle Trend</p>
          <p className={`league-bilge-analyst__trend-label ${trendClass}`}>
            {analysis.trendLabel}
          </p>
          <p className="league-bilge-analyst__trend-detail">
            {analysis.trendDetail}
          </p>
        </div>

        <p className="league-bilge-analyst__meta">
          {analysis.analyzedGames} maç analiz edildi · güven{' '}
          {Math.round(analysis.confidence * 100)}%
        </p>
      </div>
    </aside>
  );
}
