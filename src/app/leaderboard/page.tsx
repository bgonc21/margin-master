'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  season_total: number;
  best_week: number;
  weeks_played: number;
  rank: number;
}

interface WeeklyWinner {
  week: number;
  username: string;
  margin_earned: number;
  prize_cents: number;
  tiebreaker_used: string | null;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [season, setSeason] = useState<LeaderboardEntry[]>([]);
  const [weekly, setWeekly] = useState<WeeklyWinner[]>([]);
  const [tab, setTab] = useState<'season' | 'weekly'>('season');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [seasonRes, weeklyRes] = await Promise.all([
        supabase.from('overall_leaderboard').select('*').order('rank', { ascending: true }).limit(100),
        supabase.from('weekly_prizes').select('*').order('week', { ascending: false }).limit(20),
      ]);
      setSeason(seasonRes.data ?? []);
      setWeekly(weeklyRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  function scoreColor(pts: number) {
    if (pts > 0) return 'var(--green)';
    if (pts < 0) return 'var(--red)';
    return 'var(--text-2)';
  }

  function rankColor(rank: number) {
    if (rank === 1) return '#F5A623';
    if (rank === 2) return '#9090A0';
    if (rank === 3) return '#CD7F32';
    return 'var(--text-3)';
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav className="nav">
        <div className="nav-logo">MARGIN<span style={{ color: 'var(--green)' }}>MASTER</span></div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => router.push('/dashboard')}>Picks</button>
          <button className="nav-link active">Leaderboard</button>
          <button className="nav-link" onClick={() => router.push('/league')}>Leagues</button>
          <button className="nav-link" onClick={() => router.push('/profile')}>{profile?.username ?? 'Profile'}</button>
        </div>
      </nav>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: 4 }}>SEASON STANDINGS</h2>
          <p style={{ fontSize: 14 }}>Overall rankings across all leagues · 2025 NFL Season</p>
        </div>

        {/* Prize banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          marginBottom: '2rem',
          padding: '1rem',
          background: 'var(--green-bg)',
          border: '1px solid rgba(0,201,123,0.2)',
          borderRadius: 'var(--radius-lg)',
        }}>
          {[
            { label: '🥇 1st place', value: '$250' },
            { label: '🥈 2nd place', value: '$100' },
            { label: '🥉 3rd place', value: '$50' },
            { label: '⚡ Weekly high', value: '$25 / wk' },
          ].map(p => (
            <div key={p.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--green)' }}>{p.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{p.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
          {(['season', 'weekly'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}
            >
              {t === 'season' ? 'Season standings' : 'Weekly winners'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
            <span className="spinner" />
          </div>
        ) : tab === 'season' ? (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['#', 'Player', 'Weeks', 'Best week', 'Season total'].map((h, i) => (
                    <th key={h} style={{
                      padding: '12px 16px',
                      textAlign: i >= 3 ? 'right' : 'left',
                      fontSize: 11,
                      color: 'var(--text-3)',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {season.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)', fontSize: 13 }}>
                    No picks yet this season. Be the first on the board!
                  </td></tr>
                ) : season.map(entry => {
                  const isMe = entry.user_id === user?.id;
                  return (
                    <tr
                      key={entry.user_id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: isMe ? 'rgba(0,201,123,0.03)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '12px 16px', width: 48 }}>
                        <span style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.1rem',
                          color: rankColor(entry.rank),
                        }}>
                          {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : entry.rank}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontWeight: isMe ? 500 : 400 }}>
                          {entry.username}
                        </span>
                        {isMe && <span className="badge badge-green" style={{ marginLeft: 8, fontSize: 10 }}>you</span>}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: 13 }}>
                        {entry.weeks_played}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, color: scoreColor(entry.best_week) }}>
                        {entry.best_week > 0 ? '+' : ''}{entry.best_week}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <span style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.2rem',
                          color: scoreColor(entry.season_total),
                        }}>
                          {entry.season_total > 0 ? '+' : ''}{entry.season_total}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {weekly.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)', fontSize: 13 }}>
                No weekly winners yet — first prizes awarded after Week 1 concludes.
              </div>
            ) : weekly.map(w => (
              <div key={w.week} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p className="section-title" style={{ marginBottom: 2 }}>Week {w.week}</p>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
                    {w.username}
                  </div>
                  {w.tiebreaker_used && w.tiebreaker_used !== 'primary' && (
                    <span className="badge badge-amber" style={{ fontSize: 10, marginTop: 4 }}>
                      via {w.tiebreaker_used.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    color: 'var(--green)',
                    lineHeight: 1,
                  }}>
                    +{w.margin_earned}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                    ${(w.prize_cents / 100).toFixed(0)} prize
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
