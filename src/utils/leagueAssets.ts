export function champIcon(version: string, name: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${name}.png`;
}

export function itemIcon(version: string, id: number): string {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`;
}

export function spellIcon(version: string, spellId: number): string {
  const map: Record<number, string> = {
    1: 'SummonerBoost',
    3: 'SummonerExhaust',
    4: 'SummonerFlash',
    6: 'SummonerHaste',
    7: 'SummonerHeal',
    11: 'SummonerSmite',
    12: 'SummonerTeleport',
    13: 'SummonerMana',
    14: 'SummonerDot',
    21: 'SummonerBarrier',
    32: 'SummonerSnowball',
  };
  const key = map[spellId] ?? 'SummonerFlash';
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${key}.png`;
}

export function profileIcon(version: string, id: number): string {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${id}.png`;
}

export function rankEmblem(tier: string): string {
  const slug = tier.toLowerCase();
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${slug}.png`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatKda(k: number, d: number, a: number): string {
  return `${k} / ${d} / ${a}`;
}

export function formatWinRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function formatDate(ts: number): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts));
}

export function formatMastery(points: number): string {
  if (points >= 1_000_000) return `${(points / 1_000_000).toFixed(1)}M`;
  if (points >= 1_000) return `${(points / 1_000).toFixed(1)}K`;
  return String(points);
}

export function formatRelativeUpdate(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  return formatDate(ts);
}

export function tierLabel(tier: string, rank: string, lp: number): string {
  if (tier === 'UNRANKED') return 'Unranked';
  return `${tier} ${rank} · ${lp} LP`;
}
