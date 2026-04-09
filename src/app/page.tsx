'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Nav */}
      <nav className="nav">
        <div className="nav-logo">MARGIN<span>MASTER</span></div>
        <div className="nav-links">
          <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link href="/auth/signup" className="btn btn-primary btn-sm" style={{ marginLeft: 8 }}>Play free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />
        {/* Green glow */}
        <div style={{
          position: 'absolute',
          top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(0,201,123,0.12) 0%, transparent 70%)',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800 }}>
          <div className="badge badge-green" style={{ marginBottom: '1.5rem', fontSize: 12 }}>
            🏈 NFL Season 2025
          </div>

          <h1 style={{ marginBottom: '1.5rem', color: 'var(--text-1)' }}>
            PICK THE<br />
            <span style={{ color: 'var(--green)' }}>BIGGEST WIN.</span>
          </h1>

          <p style={{ fontSize: '1.1rem', maxWidth: 520, margin: '0 auto 2.5rem', color: 'var(--text-2)' }}>
            One city. One pick. Every week. Score points by margin of victory —
            or lose them by margin of defeat. The sharpest picker wins <strong style={{ color: 'var(--text-1)' }}>$250</strong>.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/signup" className="btn btn-primary btn-lg">
              Start playing — $4.99/yr
            </Link>
            <Link href="#how-it-works" className="btn btn-ghost btn-lg">
              How it works
            </Link>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', gap: '2rem', justifyContent: 'center',
            marginTop: '3rem', flexWrap: 'wrap',
          }}>
            {[
              { value: '$250', label: 'Season grand prize' },
              { value: '$25', label: 'Weekly prize' },
              { value: '18', label: 'Weeks of picks' },
              { value: '32', label: 'Cities to choose' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem',
                  color: 'var(--green)',
                  lineHeight: 1,
                  marginBottom: 4,
                }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ padding: '6rem 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="section-title">The game</p>
            <h2>Simple rules. Deep strategy.</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                num: '01',
                title: 'Pick a city',
                desc: 'Each week, choose one NFL city you think will win by the biggest margin. Each city can only be used once per season.',
              },
              {
                num: '02',
                title: 'Score by margin',
                desc: 'Win by 14? You gain 14 points. Lose by 7? You lose 7 points. Your season total is the running sum.',
              },
              {
                num: '03',
                title: 'Miss a week? Pay the price',
                desc: "Skip a week and you're hit with the biggest margin of that week — automatically deducted from your total.",
              },
              {
                num: '04',
                title: 'Highest total wins',
                desc: 'At season end the player with the most points wins $250. Weekly high scores win $25 every Tuesday.',
              },
            ].map(step => (
              <div key={step.num} className="card" style={{ padding: '1.5rem' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '3rem',
                  color: 'var(--bg-3)',
                  lineHeight: 1,
                  marginBottom: '0.75rem',
                }}>{step.num}</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ fontSize: 14 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '6rem 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div className="container-sm">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="section-title">Pricing</p>
            <h2>One price. Full access.</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Player */}
            <div className="card" style={{ padding: '2rem' }}>
              <p className="section-title">Player</p>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: 8 }}>
                $4.99<span style={{ fontSize: '1rem', color: 'var(--text-2)', fontFamily: 'var(--font-body)' }}>/yr</span>
              </div>
              <p style={{ fontSize: 13, marginBottom: '1.5rem' }}>Full season access, compete for prizes</p>
              {['Weekly picks & scoring', 'Season leaderboard', 'Join unlimited leagues', 'Compete for $250 prize', 'No ads'].map(f => (
                <div key={f} style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: 'var(--green)' }}>✓</span> {f}
                </div>
              ))}
              <Link href="/auth/signup" className="btn btn-primary btn-full" style={{ marginTop: '1.5rem' }}>
                Get started
              </Link>
            </div>

            {/* Commissioner */}
            <div className="card" style={{ padding: '2rem', borderColor: 'rgba(0,201,123,0.3)' }}>
              <p className="section-title">Commissioner</p>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: 8 }}>
                $9.99<span style={{ fontSize: '1rem', color: 'var(--text-2)', fontFamily: 'var(--font-body)' }}>/league</span>
              </div>
              <p style={{ fontSize: 13, marginBottom: '1.5rem' }}>Everything in Player, plus run your own league</p>
              {['Create a private league', 'Invite friends with a code', 'Custom league leaderboard', 'Earn free leagues via referrals', 'Commissioner badge'].map(f => (
                <div key={f} style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: 'var(--green)' }}>✓</span> {f}
                </div>
              ))}
              <Link href="/auth/signup" className="btn btn-secondary btn-full" style={{ marginTop: '1.5rem' }}>
                Create a league
              </Link>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', marginTop: '1rem' }}>
            Invite 5 friends who subscribe → earn 1 free league creation
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        color: 'var(--text-3)',
        fontSize: 12,
      }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-2)' }}>
            MARGIN<span style={{ color: 'var(--green)' }}>MASTER</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: 8 }}>
          <Link href="/terms" style={{ color: 'var(--text-3)' }}>Terms</Link>
          <Link href="/privacy" style={{ color: 'var(--text-3)' }}>Privacy</Link>
          <Link href="/contest-rules" style={{ color: 'var(--text-3)' }}>Contest Rules</Link>
        </div>
        <p>© 2025 Margin Master. Not affiliated with the NFL.</p>
      </footer>
    </div>
  );
}
