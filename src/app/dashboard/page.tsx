'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { usePicks, type Game, type Pick } from '../../hooks/usePicks';
import { supabase } from '../../lib/supabase';

const CURRENT_SEASON = 2025;
const TOTAL_WEEKS = 18;

function formatKickoff(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function isKickedOff(kickoffTime: string) {
  return new Date(kickoffTime) <= new Date();
}

function scoreColor(pts: number | null) {
  if (pts === null) return 'var(--text-2)';
  if (pts > 0) return 'var(--green)';
  if (pts < 0) return 'var(--red)';
  return 'var(--text-2)';
}

function GameCard({ game, pick, isSelected, isUsed, canPick, onSelect }: {
  game: Game; pick: Pick | null; isSelected: boolean;
  isUsed: { home: boolean; away: boolean }; canPick: boolean;
  onSelect: (gameId: string) => void;
}) {
  const isPicked = pick?.game_id === game.id;
  const isLocked = isPicked && pick?.locked_at !== null;
  const isFinal = game.status === 'final';
  const isLive = game.status === 'live';
  const pts = isPicked ? pick?.points_earned : null;
  const kickedOff = isKickedOff(game.kickoff_time);

  let borderColor = 'var(--border)';
  if (isLocked) borderColor = 'var(--green)';
  else if (isSelected) borderColor = 'rgba(59,130,246,0.5)';
  else if (isPicked && !isLocked) borderColor = 'rgba(245,166,35,0.4)';

  return (
    <div onClick={() => canPick && !kickedOff && onSelect(game.id)} style={{
      background: isSelected ? 'rgba(59,130,246,0.04)' : isLocked ? 'rgba(0,201,123,0.04)' : 'var(--bg-1)',
      border: `1px solid ${borderColor}`, borderRadius: 'var(--radius-lg)',
      padding: '1rem 1.25rem', cursor: canPick && !kickedOff ? 'pointer' : 'default',
      transition: 'all 0.15s', position: 'relative', overflow: 'hidden',
    }}>
      {isLive && (
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 1.5s ease infinite' }} />
          <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 500 }}>LIVE</span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 500, opacity: isUsed.away && !isPicked ? 0.4 : 1 }}>{game.away_city}</span>
          {isUsed.away && !isPicked && <span className="badge badge-amber" style={{ fontSize: 9 }}>used</span>}
        </div>
        <div style={{ textAlign: 'center', padding: '0 8px' }}>
          {isFinal || isLive ? (
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: 2 }}>
              <span style={{ color: (game.away_score ?? 0) > (game.home_score ?? 0) ? 'var(--text-1)' : 'var(--text-3)' }}>{game.away_score}</span>
              <span style={{ color: 'var(--text-3)', margin: '0 4px' }}>–</span>
              <span style={{ color: (game.home_score ?? 0) > (game.away_score ?? 0) ? 'var(--text-1)' : 'var(--text-3)' }}>{game.home_score}</span>
            </div>
          ) : <span style={{ fontSize: 11, color: 'var(--text-3)' }}>@</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
          {isUsed.home && !isPicked && <span className="badge badge-amber" style={{ fontSize: 9 }}>used</span>}
          <span style={{ fontSize: 14, fontWeight: 500, opacity: isUsed.home && !isPicked ? 0.4 : 1 }}>{game.home_city}</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isFinal && <span className="badge badge-gray" style={{ fontSize: 10 }}>Margin: {game.margin}</span>}
          {!isFinal && !isLive && game.spread && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Spread: {game.spread > 0 ? '+' : ''}{game.spread}</span>}
          {!isFinal && !isLive && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{formatKickoff(game.kickoff_time)}</span>}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {isLocked && pts !== null && <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: scoreColor(pts) }}>{pts > 0 ? '+' : ''}{pts}</span>}
          {isLocked && pts === null && <span className="badge badge-amber" style={{ fontSize: 10 }}>Locked · pending</span>}
          {isPicked && !isLocked && <span className="badge badge-amber" style={{ fontSize: 10 }}>Staged</span>}
          {isLocked && <span className="badge badge-green" style={{ fontSize: 10 }}>✓ Locked</span>}
        </div>
      </div>
    </div>
  );
}

function PickPanel({ game, pick, designatedGameDesc, onStage, onLock, onChange, loading }: {
  game: Game | null; pick: Pick | null; designatedGameDesc: string | null;
  onStage: (city: string) => void;
  onLock: (scoreGuess: number | null, secGameId: string | null, secCity: string | null) => void;
  onChange: () => void; loading: boolean;
}) {
  const [scoreGuess, setScoreGuess] = useState('');
  if (!game && !pick) return null;
  const isLocked = pick?.locked_at !== null;
  if (isLocked) return null;
  const isStaged = !!pick && !isLocked;

  return (
    <div className="card" style={{ marginTop: '1rem', border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.03)' }}>
      {!isStaged && game ? (
        <>
          <p className="section-title" style={{ marginBottom: 12 }}>Pick a side — {game.away_city} @ {game.home_city}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button className="btn btn-secondary btn-full" onClick={() => onStage(game.away_city)} disabled={loading}>{game.away_city}</button>
            <button className="btn btn-secondary btn-full" onClick={() => onStage(game.home_city)} disabled={loading}>{game.home_city}</button>
          </div>
        </>
      ) : isStaged && pick ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <p className="section-title" style={{ marginBottom: 2 }}>Staged pick</p>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--amber)' }}>{pick.city_picked}</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onChange} disabled={loading}>Change pick</button>
          </div>
          <div className="divider" style={{ margin: '0.75rem 0' }} />
          <p className="section-title" style={{ marginBottom: 10 }}>Tiebreakers (submitted with your pick)</p>
          {designatedGameDesc && (
            <div className="form-group">
              <label className="label">Score guess — {designatedGameDesc}</label>
              <input className="input" type="number" placeholder="Combined total score (e.g. 47)"
                value={scoreGuess} onChange={e => setScoreGuess(e.target.value)} min={0} max={150} />
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Closest to final combined score wins tiebreaker</p>
            </div>
          )}
          <button className="btn btn-primary btn-full" style={{ marginTop: '0.5rem' }}
            onClick={() => onLock(scoreGuess ? parseInt(scoreGuess) : null, null, null)} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : `Lock in ${pick.city_picked}`}
          </button>
          <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', marginTop: 6 }}>
            Locked picks cannot be changed. City is consumed for the season.
          </p>
        </>
      ) : null}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(3);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [activeLeagueId, setActiveLeagueId] = useState<string | null>(null);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [gamesTimeout, setGamesTimeout] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const { games, currentPick, designatedGame, usedCities, loading: picksLoading, stagePick, lockPick, changePick } =
    usePicks(activeLeagueId, currentWeek);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('league_members')
      .select('league_id, leagues(id, name, sport, season)')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        console.log('leagues:', data, error);
        const ls = (data ?? []).map((lm: any) => 
  Array.isArray(lm.leagues) ? lm.leagues[0] : lm.leagues
).filter(Boolean);
        setLeagues(ls);
        if (ls.length > 0 && !activeLeagueId) {
          setActiveLeagueId(ls[0].id);
        } else if (ls.length === 0) {
          setActiveLeagueId('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
        }
      });
  }, [user]);

  useEffect(() => {
    setGamesTimeout(false);
    const timer = setTimeout(() => setGamesTimeout(true), 4000);
    return () => clearTimeout(timer);
  }, [currentWeek, activeLeagueId]);

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleStage(city: string) {
    if (!selectedGame) return;
    setActionLoading(true);
    try {
      await stagePick(selectedGame, city);
      setSelectedGame(null);
      showToast(`${city} staged — lock it in before kickoff`);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally { setActionLoading(false); }
  }

  async function handleLock(scoreGuess: number | null, secGameId: string | null, secCity: string | null) {
    setActionLoading(true);
    try {
      await lockPick(scoreGuess ?? undefined, secGameId ?? undefined, secCity ?? undefined);
      showToast('Pick locked in! Good luck 🏈', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally { setActionLoading(false); }
  }

  async function handleChange() {
    setActionLoading(true);
    try {
      await changePick();
      showToast('Pick cleared — choose again');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally { setActionLoading(false); }
  }

  const selectedGameObj = selectedGame ? games.find(g => g.id === selectedGame) ?? null : null;

  if (authLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner" /></div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav className="nav">
        <div className="nav-logo">MARGIN<span style={{ color: 'var(--green)' }}>MASTER</span></div>
        <div className="nav-links">
          <button className="nav-link active">Picks</button>
          <button className="nav-link" onClick={() => router.push('/leaderboard')}>Leaderboard</button>
          <button className="nav-link" onClick={() => router.push('/league')}>Leagues</button>
          <button className="nav-link" onClick={() => router.push('/profile')}>{profile?.username ?? 'Profile'}</button>
        </div>
      </nav>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '2rem' }}>
          {[
            { label: 'Season total', value: '+0', color: 'var(--green)' },
            { label: 'Weeks played', value: '0', color: 'var(--text-1)' },
            { label: 'Cities used', value: `${usedCities.size} / 32`, color: 'var(--text-1)' },
            { label: 'Season rank', value: '—', color: 'var(--amber)' },
          ].map(m => (
            <div key={m.label} className="metric">
              <div className="metric-value" style={{ color: m.color }}>{m.value}</div>
              <div className="metric-label">{m.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {leagues.map(l => (
                  <button key={l.id} onClick={() => setActiveLeagueId(l.id)}
                    className={`btn btn-sm ${activeLeagueId === l.id ? 'btn-primary' : 'btn-ghost'}`}>{l.name}</button>
                ))}
                <button className="btn btn-sm btn-ghost" onClick={() => router.push('/league')}>+ League</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 4, marginBottom: '1rem', overflowX: 'auto', paddingBottom: 4 }}>
              {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map(w => (
                <button key={w} onClick={() => { setCurrentWeek(w); setSelectedGame(null); }} style={{
                  padding: '5px 12px', borderRadius: 'var(--radius-md)',
                  border: `1px solid ${w === currentWeek ? 'var(--green)' : 'var(--border)'}`,
                  background: w === currentWeek ? 'var(--green-bg)' : 'transparent',
                  color: w === currentWeek ? 'var(--green)' : 'var(--text-3)',
                  fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-body)', transition: 'all 0.1s', flexShrink: 0,
                }}>Wk {w}</button>
              ))}
            </div>

            {picksLoading && !gamesTimeout ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
                <span className="spinner" />
                <p style={{ marginTop: 12 }}>Loading games...</p>
              </div>
            ) : (picksLoading && gamesTimeout) || games.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
                <p>No games scheduled for Week {currentWeek} yet.</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>Check back closer to game day.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {games.map(game => (
                  <GameCard key={game.id} game={game} pick={currentPick}
                    isSelected={selectedGame === game.id}
                    isUsed={{
                      home: usedCities.has(game.home_city) && currentPick?.city_picked !== game.home_city,
                      away: usedCities.has(game.away_city) && currentPick?.city_picked !== game.away_city,
                    }}
                    canPick={!currentPick?.locked_at && games.some(g => !isKickedOff(g.kickoff_time))}
                    onSelect={id => setSelectedGame(selectedGame === id ? null : id)} />
                ))}
              </div>
            )}

            <PickPanel game={selectedGameObj} pick={currentPick}
              designatedGameDesc={designatedGame?.description ?? null}
              onStage={handleStage} onLock={handleLock} onChange={handleChange} loading={actionLoading} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card">
              <p className="section-title">Week {currentWeek} status</p>
              {currentPick ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Your pick</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{currentPick.city_picked}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Status</span>
                    {currentPick.locked_at ? <span className="badge badge-green">Locked</span> : <span className="badge badge-amber">Staged</span>}
                  </div>
                  {currentPick.points_earned !== null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Points</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: scoreColor(currentPick.points_earned) }}>
                        {currentPick.points_earned > 0 ? '+' : ''}{currentPick.points_earned}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <p style={{ fontSize: 13, marginBottom: 8 }}>No pick yet this week</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Miss the week? You'll be penalized the biggest margin.</p>
                </div>
              )}
            </div>

            <div className="card">
              <p className="section-title">Cities used ({usedCities.size}/32)</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {usedCities.size === 0 ? (
                  <p style={{ fontSize: 13 }}>None yet — all 32 cities available</p>
                ) : Array.from(usedCities).map(city => (
                  <span key={city} className="badge badge-gray" style={{ fontSize: 11 }}>{city}</span>
                ))}
              </div>
            </div>

            <div className="card" style={{ border: '1px solid rgba(0,201,123,0.2)', background: 'var(--green-bg)' }}>
              <p className="section-title" style={{ color: 'var(--green)' }}>Prizes this season</p>
              {[
                { label: 'Weekly high score', value: '$25' },
                { label: 'Season #1', value: '$250' },
                { label: 'Season #2', value: '$100' },
                { label: 'Season #3', value: '$50' },
              ].map(p => (
                <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(0,201,123,0.1)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-2)' }}>{p.label}</span>
                  <span style={{ fontFamily: 'var(--font-display)', color: 'var(--green)' }}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? 'var(--green)' : 'var(--red)',
          color: toast.type === 'success' ? '#000' : '#fff',
          padding: '10px 20px', borderRadius: 'var(--radius-md)',
          fontSize: 14, fontWeight: 500, boxShadow: 'var(--shadow-lg)',
          zIndex: 1000, animation: 'pageIn 0.2s ease',
        }}>{toast.msg}</div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}