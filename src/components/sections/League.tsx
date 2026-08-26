import { useLeagueData } from '../../hooks/useLeagueData';

import SEOHead from '../../seo/SEOHead';

import ChampionStats from '../league/ChampionStats';

import CurrentForm from '../league/CurrentForm';

import DeeperStatistics from '../league/DeeperStatistics';

import '../league/league.css';

import LeagueSkeleton from '../league/LeagueSkeleton';

import MatchHistory from '../league/MatchHistory';

import MatchInsightsFeed from '../league/MatchInsightsFeed';

import ProfileHeader, { LeagueToolbar } from '../league/ProfileHeader';



export default function League() {

  const { data, loading, error, stale, refresh } = useLeagueData();



  return (

    <section className="league-page" aria-label="League of Legends profil">

      <SEOHead page="league" />



      {loading && !data && <LeagueSkeleton />}



      {error && !data && (

        <div className="league-error">

          <p className="league-error__text">{error}</p>

          <button type="button" className="league-toolbar__refresh" onClick={refresh}>

            Tekrar dene

          </button>

        </div>

      )}



      {data && (

        <>

          <LeagueToolbar stale={stale} loading={loading} onRefresh={refresh} />



          {error && stale && (

            <p className="league-stale-notice">

              {error} — önbellekteki veriler gösteriliyor.

            </p>

          )}



          <ProfileHeader data={data} fetchedAt={data.fetchedAt} />



          <CurrentForm form={data.recentForm} matches={data.matches} />



          <ChampionStats
            stats={data.championStats}
            version={data.ddragonVersion}
          />



          <MatchHistory

            matches={data.matches}

            version={data.ddragonVersion}

            puuid={data.puuid}

          />



          <MatchInsightsFeed matches={data.matches} version={data.ddragonVersion} />



          <DeeperStatistics

            matches={data.matches}

            championStats={data.championStats}

            progression={data.rankProgression}

            soloRank={data.soloRank}

            form={data.recentForm}

          />

        </>

      )}

    </section>

  );

}

