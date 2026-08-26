import { useLeagueData } from '../../hooks/useLeagueData';
import SEOHead from '../../seo/SEOHead';
import ChampionStats from '../league/ChampionStats';
import LeagueCharts from '../league/LeagueCharts';
import '../league/league.css';
import LeagueSkeleton from '../league/LeagueSkeleton';
import MatchHistory, { RecentFormSummary } from '../league/MatchHistory';
import ProfileHeader, { LeagueToolbar } from '../league/ProfileHeader';
import RankProgression from '../league/RankProgression';
import VexVsQiyana from '../league/VexVsQiyana';

export default function League() {
  const { data, loading, error, stale, refresh } = useLeagueData();

  return (
    <section className="league-page" aria-label="League of Legends profil">
      <SEOHead page="league" />

      <header className="league-page__header">
        <h1 className="league-page__title glitch" data-text="Summoner's Rift">
          Summoner&apos;s Rift
        </h1>
        <p className="league-page__subtitle">
          Kişisel LoL dashboard — Bilge analiz eder, Dilenci yorumlar.
        </p>
      </header>

      {loading && !data && <LeagueSkeleton />}

      {error && !data && (
        <div className="league-error card-surface">
          <p>{error}</p>
          <button
            type="button"
            className="league-toolbar__refresh"
            style={{ marginTop: '1rem' }}
            onClick={refresh}
          >
            Tekrar dene
          </button>
        </div>
      )}

      {data && (
        <>
          <LeagueToolbar
            fetchedAt={data.fetchedAt}
            stale={stale}
            loading={loading}
            onRefresh={refresh}
          />

          {error && stale && (
            <p style={{ color: '#fbbf24', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {error} — önbellekteki veriler gösteriliyor.
            </p>
          )}

          <ProfileHeader data={data} />
          <RankProgression progression={data.rankProgression} />

          <div className="league-grid-2">
            <RecentFormSummary form={data.recentForm} />
            <VexVsQiyana compare={data.vexVsQiyana} />
          </div>

          <ChampionStats stats={data.championStats} version={data.ddragonVersion} />
          <MatchHistory
            matches={data.matches}
            version={data.ddragonVersion}
            puuid={data.puuid}
          />
          <LeagueCharts matches={data.matches} championStats={data.championStats} />
        </>
      )}
    </section>
  );
}
