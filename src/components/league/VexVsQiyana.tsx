import type { PlayerSummary } from '../../types/league';
import { formatWinRate } from '../../utils/leagueAssets';

interface VexVsQiyanaProps {
  compare: PlayerSummary['vexVsQiyana'];
  embedded?: boolean;
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
      <h4 className="league-compare__champ">{label}</h4>
      <p className="league-compare__wr">{formatWinRate(stats.winRate)} Win Rate</p>
      <div className="league-compare__metrics">
        <div>
          <p className="league-stat-label">Games</p>
          <p className="league-compare__metric">{stats.games}</p>
        </div>
        <div>
          <p className="league-stat-label">KDA</p>
          <p className="league-compare__metric">{stats.avgKda.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
}

export default function VexVsQiyana({ compare, embedded }: VexVsQiyanaProps) {
  if (!compare.vex && !compare.qiyana) return null;

  return (
    <div className={`league-compare-wrap${embedded ? ' league-compare-wrap--embedded' : ''}`}>
      {!embedded && (
        <h3 className="league-section-title">Vex vs Qiyana</h3>
      )}
      <div className="league-compare card-surface">
        {compare.vex ? (
          <SideStats label="VEX" stats={compare.vex} />
        ) : (
          <p className="league-compare__empty">Vex verisi yok</p>
        )}
        <span className="league-compare__vs">vs</span>
        {compare.qiyana ? (
          <SideStats label="QIYANA" stats={compare.qiyana} />
        ) : (
          <p className="league-compare__empty">Qiyana verisi yok</p>
        )}
        {compare.verdict ? (
          <p className="league-compare__verdict">{compare.verdict}</p>
        ) : (
          <p className="league-compare__verdict league-compare__verdict--muted">
            Karşılaştırma için her championda en az {compare.minGames} maç gerekli.
          </p>
        )}
      </div>
    </div>
  );
}
