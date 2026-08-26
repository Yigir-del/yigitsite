import { rankEmblem } from '../../utils/leagueAssets';

type RankEmblemSize = 'hero' | 'ladder' | 'ladder-current';

interface RankEmblemProps {
  tier: string;
  size?: RankEmblemSize;
  className?: string;
}

const INTRINSIC: Record<RankEmblemSize, number> = {
  hero: 148,
  ladder: 80,
  'ladder-current': 90,
};

/** Fixed-size classic LoL rank emblem */
export default function RankEmblem({
  tier,
  size = 'ladder',
  className = '',
}: RankEmblemProps) {
  const px = INTRINSIC[size];

  return (
    <div
      className={`league-rank-emblem league-rank-emblem--${size}${className ? ` ${className}` : ''}`}
      aria-hidden
    >
      <img
        src={rankEmblem(tier)}
        alt=""
        width={px}
        height={px}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </div>
  );
}
