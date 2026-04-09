'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

// ── Shared auth card wrapper ──────────────────

function AuthCard({ children, title, subtitle }: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      background: 'var(--bg)',
    }}>
      <Link href="/" style={{ marginBottom: '2rem' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--text-1)', letterSpacing: '0.05em' }}>
          MARGIN<span style={{ color: 'var(--green)' }}>MASTER</span>
        </div>
      </Link>

      <div className="card" style={{ width: '100%', maxWidth: 400, padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 6 }}>{title}</h2>
        <p style={{ fontSize: 13, marginBottom: '1.5rem' }}>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

// ── Login page ────────────────────────────────

export function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to make your picks">
      <button
        onClick={handleGoogleLogin}
        className="btn btn-secondary btn-full"
        style={{ marginBottom: '1rem' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '1rem 0' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>or</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="form-group">
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <div style={{
            background: 'var(--red-bg)', border: '1px solid rgba(255,76,76,0.2)',
            borderRadius: 'var(--radius-md)', padding: '10px 14px',
            fontSize: 13, color: 'var(--red)', marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Sign in'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 13, marginTop: '1rem' }}>
        No account?{' '}
        <Link href="/auth/signup" style={{ color: 'var(--green)' }}>Sign up</Link>
      </p>
    </AuthCard>
  );
}

// ── Signup page ───────────────────────────────

export function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Handle referral code
    if (referralCode) {
      await fetch('/api/referral/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referral_code: referralCode }),
      });
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <AuthCard title="Check your email" subtitle="We sent you a confirmation link">
        <div style={{
          background: 'var(--green-bg)', border: '1px solid rgba(0,201,123,0.2)',
          borderRadius: 'var(--radius-md)', padding: '1rem',
          fontSize: 14, color: 'var(--green)', textAlign: 'center',
        }}>
          Click the link in your email to confirm your account and start playing.
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, marginTop: '1rem' }}>
          <Link href="/auth/login" style={{ color: 'var(--green)' }}>Back to sign in</Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create your account" subtitle="Join and compete for $250 this season">
      <form onSubmit={handleSignup}>
        <div className="form-group">
          <label className="label">Username</label>
          <input
            className="input"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
            placeholder="coolpicker"
            required
          />
        </div>
        <div className="form-group">
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="form-group">
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </div>
        <div className="form-group">
          <label className="label">Referral code <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
          <input
            className="input"
            type="text"
            value={referralCode}
            onChange={e => setReferralCode(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXX"
          />
        </div>

        {error && (
          <div style={{
            background: 'var(--red-bg)', border: '1px solid rgba(255,76,76,0.2)',
            borderRadius: 'var(--radius-md)', padding: '10px 14px',
            fontSize: 13, color: 'var(--red)', marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Create account'}
        </button>

        <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: '0.75rem' }}>
          By signing up you agree to our{' '}
          <Link href="/terms" style={{ color: 'var(--text-3)' }}>Terms</Link> and{' '}
          <Link href="/privacy" style={{ color: 'var(--text-3)' }}>Privacy Policy</Link>.
          You must be 18+ to play.
        </p>
      </form>

      <p style={{ textAlign: 'center', fontSize: 13, marginTop: '1rem' }}>
        Already have an account?{' '}
        <Link href="/auth/login" style={{ color: 'var(--green)' }}>Sign in</Link>
      </p>
    </AuthCard>
  );
}
