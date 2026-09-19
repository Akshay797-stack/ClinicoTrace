'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const DEMO_USERS = [
  { username: 'dr.priya', password: 'demo2026', role: 'doctor', name: 'Dr. Priya Sharma', unit: 'OPD — General Medicine' },
  { username: 'nurse.kavya', password: 'demo2026', role: 'nurse', name: 'Kavya R.', unit: 'Ward B' },
  { username: 'pharm.rajan', password: 'demo2026', role: 'pharmacist', name: 'Rajan M.', unit: 'Central Pharmacy' },
  { username: 'admin.ops', password: 'demo2026', role: 'admin', name: 'Ops Admin', unit: 'Hospital Administration' },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('dr.priya');
  const [password, setPassword] = useState('demo2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 400));

    const user = DEMO_USERS.find(
      (u) => u.username === username.trim().toLowerCase() && u.password === password
    );

    if (!user) {
      setError('Invalid credentials. For demo: dr.priya / demo2026');
      setLoading(false);
      return;
    }

    // Store session in sessionStorage (demo only)
    sessionStorage.setItem('ct_user', JSON.stringify(user));
    router.push(`/${user.role}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--ct-bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Demo Banner */}
      <div className="ct-demo-banner">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M6 4v4M6 3v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Demo Mode — Bharat Build Hackathon 2026 · All data is simulated · Not for clinical use
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          {/* Logo */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'var(--ct-blue)',
                borderRadius: '7px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M9 3h2v5h5v2h-5v5H9v-5H4v-2h5z" fill="white"/>
                  <circle cx="10" cy="10" r="9" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5"/>
                </svg>
              </div>
              <span style={{
                fontFamily: 'var(--ct-font-sans)',
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--ct-text-primary)',
                letterSpacing: '-0.03em',
              }}>
                Clinico<span style={{ color: 'var(--ct-blue)' }}>Trace</span>
                <sup style={{ fontSize: '10px', color: 'var(--ct-text-muted)', fontWeight: 500, letterSpacing: 0 }}>™</sup>
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--ct-text-muted)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Clinical Safety System
            </p>
          </div>

          {/* Login Card */}
          <div className="ct-panel">
            <div className="ct-panel-header">
              <span className="ct-text-head-sm" style={{ color: 'var(--ct-text-primary)' }}>Sign in to ClinicoTrace</span>
              <span className="ct-badge ct-badge-blue" style={{ fontSize: '10px' }}>Secure</span>
            </div>
            <div className="ct-panel-body">
              <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label htmlFor="ct-hospital" className="ct-field-label" style={{ display: 'block', marginBottom: '5px' }}>
                    Hospital / Organization
                  </label>
                  <input
                    id="ct-hospital"
                    type="text"
                    className="ct-input"
                    defaultValue="St. Theresa Medical Centre, Bangalore"
                    readOnly
                    style={{ background: 'var(--ct-bg)', cursor: 'default' }}
                  />
                </div>
                <div>
                  <label htmlFor="ct-username" className="ct-field-label" style={{ display: 'block', marginBottom: '5px' }}>
                    Username
                  </label>
                  <input
                    id="ct-username"
                    type="text"
                    className="ct-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    autoComplete="username"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="ct-password" className="ct-field-label" style={{ display: 'block', marginBottom: '5px' }}>
                    Password
                  </label>
                  <input
                    id="ct-password"
                    type="password"
                    className="ct-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>

                {error && (
                  <div className="ct-alert ct-alert-red" style={{ fontSize: '12px', padding: '8px 12px' }}>
                    {error}
                  </div>
                )}

                <button
                  id="ct-signin-btn"
                  type="submit"
                  className="ct-btn ct-btn-primary"
                  disabled={loading}
                  style={{ justifyContent: 'center', marginTop: '4px', padding: '10px 16px' }}
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            </div>

            {/* Security status */}
            <div style={{
              padding: '10px 14px',
              borderTop: '1px solid var(--ct-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--ct-bg)',
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--ct-green)', flexShrink: 0 }}>
                <path d="M6 1L1 3v4c0 2.2 2 4 5 5 3-1 5-2.8 5-5V3L6 1z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: '11px', color: 'var(--ct-text-muted)' }}>
                Protected clinical environment · TLS 1.3 · Session-bound authentication
              </span>
            </div>
          </div>

          {/* Demo quick-login */}
          <div style={{ marginTop: '16px' }}>
            <p className="ct-text-label ct-muted" style={{ marginBottom: '8px', textAlign: 'center' }}>Demo quick access</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {DEMO_USERS.map((u) => (
                <button
                  key={u.username}
                  className="ct-btn ct-btn-secondary ct-btn-sm"
                  style={{ justifyContent: 'center', padding: '6px 10px' }}
                  onClick={() => { setUsername(u.username); setPassword(u.password); }}
                  type="button"
                >
                  <span style={{ fontSize: '10px', color: 'var(--ct-text-muted)', textTransform: 'capitalize' }}>
                    {u.role} ·
                  </span>
                  {' '}{u.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '10px', color: 'var(--ct-text-muted)' }}>
            ClinicoTrace v1.0 · Bharat Build Hackathon 2026
            <br />
            <span style={{ color: 'var(--ct-blue)' }}>SAFE · ACCURATE · ACCESSIBLE</span>
          </p>
        </div>
      </div>
    </div>
  );
}
