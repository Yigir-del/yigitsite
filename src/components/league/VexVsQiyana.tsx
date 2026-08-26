import type { PlayerSummary } from '../../types/league';
import { formatWinRate } from '../../utils/leagueAssets';

interface VexVsQiyanaProps {
  compare: PlayerSummary['vexVsQiyana'];
}

function SideStats({
  label,
  stats,
}: {
  label: string;
  stats: NonNullable<PlayerSummary['vexVsQiyana']['vex']>;
}) {
  return (
    <div className="league-compare__side">
      <h4 style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '0.06em' }}>{label}</h4>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        {stats.games} maç
      </p>
      <p style={{ margin: '0.25rem 0' }}>{formatWinRate(stats.winRate)} Win Rate</p>
      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        KDA {stats.avgKda.toFixed(2)}
      </p>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Ort. {stats.avgKills}K / {stats.avgDeaths}D
      </p>
    </div>
  );
}

export default function VexVsQiyana({ compare }: VexVsQiyanaProps) {
  if (!compare.vex && !compare.qiyana) return null;

  return (
    <section aria-label="Vex vs Qiyana">
      <h3 className="league-section-title">Vex vs Qiyana</h3>
      <div className="league-compare card-surface">
        {compare.vex ? (
          <SideStats label="VEX" stats={compare.vex} />
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Vex verisi yok</p>
        )}
        <span className="league-compare__vs">vs</span>
        {compare.qiyana ? (
          <SideStats label="QIYANA" stats={compare.qiyana} />
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Qiyana verisi yok</p>
        )}
        {compare.verdict ? (
          <p className="league-compare__verdict">{compare.verdict}</p>
        ) : (
          <p className="league-compare__verdict" style={{ fontStyle: 'normal', opacity: 0.7 }}>
            Karşılaştırma için her championda en az {compare.minGames} maç gerekli.
          </p>
        )}
      </div>
    </section>
  );
}
