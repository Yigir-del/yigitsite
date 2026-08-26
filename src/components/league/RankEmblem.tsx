import { rankEmblem, type RankEmblemVariant } from '../../utils/leagueAssets';

type RankEmblemSize = 'hero' | 'ladder' | 'ladder-current';

interface RankEmblemProps {
  tier: string;
  size?: RankEmblemSize;
  variant?: RankEmblemVariant;
  className?: string;
}

const INTRINSIC: Record<RankEmblemSize, number> = {
  hero: 148,
  ladder: 80,
  'ladder-current': 90,
};

/** Fixed-size rank emblem — prevents layout shift and CDN padding shrink */
export default function RankEmblem({
  tier,
  size = 'ladder',
  variant,
  className = '',
}: RankEmblemProps) {
  const px = INTRINSIC[size];
  const assetVariant =
    variant ?? (size === 'hero' ? 'wings' : size === 'ladder-current' ? 'plate' : 'emblem');

  return (
    <div
      className={`league-rank-emblem league-rank-emblem--${size}${className ? ` ${className}` : ''}`}
      aria-hidden
    >
      <img
        src={rankEmblem(tier, assetVariant)}
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
