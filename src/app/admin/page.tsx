'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const METRICS = [
  { label: 'Patients processed today', value: '127', change: '+12 vs yesterday', color: 'var(--ct-blue)' },
  { label: 'Prescriptions reviewed', value: '89', change: '100% safety checked', color: 'var(--ct-green)' },
  { label: 'Safety alerts raised', value: '14', change: '3 critical, 11 moderate', color: 'var(--ct-amber)' },
  { label: 'Avg clinician response (min)', value: '2.4', change: 'Target: < 3 min', color: 'var(--ct-blue)' },
];

const LANG_USAGE = [
  { lang: 'Tamil', code: 'ta', count: 52, pct: 58 },
  { lang: 'Hindi', code: 'hi', count: 21, pct: 24 },
  { lang: 'Telugu', code: 'te', count: 10, pct: 11 },
  { lang: 'English', code: 'en', count: 6, pct: 7 },
];

const ALERT_TYPES = [
  { type: 'DDI — Moderate', count: 9, color: 'var(--ct-amber)' },
  { type: 'DDI — Critical', count: 2, color: 'var(--ct-red)' },
  { type: 'Drug-Condition', count: 2, color: 'var(--ct-amber)' },
  { type: 'Allergy', count: 1, color: 'var(--ct-red)' },
];

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; unit: string } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('ct_user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    setUser(u);
  }, [router]);

  return (
    <div className="ct-shell">
      <nav className="ct-nav-rail">
        <div style={{ padding: '8px 4px', marginBottom: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'var(--ct-blue)', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M7 3h2v3h3v2h-3v3H7v-3H4V6h3z" fill="white"/></svg>
          </div>
        </div>
        {['📊', '👥', '🛡', '📁'].map((icon, i) => (
          <button key={i} className={`ct-nav-item${i === 0 ? ' active' : ''}`}>
            <span style={{ fontSize: '16px' }}>{icon}</span>
          </button>
        ))}
      </nav>

      <header className="ct-header">
        <div style={{ flex: 1 }}>
          <span className="ct-text-label ct-muted">Hospital Administration</span>
          <span style={{ margin: '0 8px', color: 'var(--ct-border)' }}>·</span>
          <span className="ct-text-body-sm ct-muted">St. Theresa Medical Centre, Bangalore</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="ct-text-ui">{user?.name}</span>
          <span className="ct-badge ct-badge-gray">Admin</span>
        </div>
      </header>

      <main className="ct-main">
        <div className="ct-demo-banner">
          Demo Mode — Bharat Build Hackathon 2026 · Operational metrics (simulated)
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <h1 className="ct-text-head-lg">Operational Dashboard</h1>
            <span className="ct-text-body-sm ct-muted">Today · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          {/* KPI row — restrained, information-dense */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {METRICS.map((m) => (
              <div key={m.label} className="ct-panel">
                <div style={{ padding: '14px' }}>
                  <div className="ct-field-label" style={{ marginBottom: '6px' }}>{m.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: m.color, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '4px' }}>
                    {m.value}
                  </div>
                  <div className="ct-text-body-sm ct-muted">{m.change}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Language usage */}
            <div className="ct-panel">
              <div className="ct-panel-header">
                <span className="ct-text-head-sm">Patient Communication Language</span>
                <span className="ct-badge ct-badge-green">Today</span>
              </div>
              <div className="ct-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {LANG_USAGE.map((l) => (
                  <div key={l.code}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="ct-text-ui">{l.lang}</span>
                      <span className="ct-text-body-sm ct-muted">{l.count} patients ({l.pct}%)</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--ct-bg-alt)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${l.pct}%`,
                        background: 'var(--ct-blue)', borderRadius: '3px',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                ))}
                <p className="ct-text-body-sm ct-muted" style={{ marginTop: '4px' }}>
                  Tamil is the primary patient communication language. Multilingual accessibility is active.
                </p>
              </div>
            </div>

            {/* Safety alert distribution */}
            <div className="ct-panel">
              <div className="ct-panel-header">
                <span className="ct-text-head-sm">Safety Alert Distribution</span>
                <span className="ct-badge ct-badge-amber">14 today</span>
              </div>
              <div className="ct-panel-body">
                <table className="ct-table">
                  <thead>
                    <tr>
                      <th>Alert Type</th>
                      <th>Count</th>
                      <th>Proportion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ALERT_TYPES.map((a) => (
                      <tr key={a.type}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: a.color, flexShrink: 0 }} />
                            {a.type}
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{a.count}</td>
                        <td>
                          <div style={{ height: '5px', background: 'var(--ct-bg-alt)', borderRadius: '3px', width: '80px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(a.count / 14) * 100}%`, background: a.color, borderRadius: '3px' }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: '12px', padding: '10px', background: 'var(--ct-bg)', borderRadius: 'var(--ct-radius)', border: '1px solid var(--ct-border-subtle)' }}>
                  <p className="ct-text-body-sm ct-muted">
                    All 14 alerts required clinician review. 0 prescriptions auto-modified by system.
                    ClinicoTrace never auto-authorizes prescriptions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="ct-panel">
            <div className="ct-panel-header">
              <span className="ct-text-head-sm">Recent Activity</span>
            </div>
            <table className="ct-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Event</th>
                  <th>Clinician</th>
                  <th>Patient</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { time: '09:42', event: 'Prescription authorized', clinician: 'Dr. Priya Sharma', patient: 'Arun Kumar (CT-2026-00124)', status: 'complete' },
                  { time: '09:40', event: 'Safety alert — DDI (Moderate)', clinician: 'Dr. Priya Sharma', patient: 'Arun Kumar (CT-2026-00124)', status: 'reviewed' },
                  { time: '09:38', event: 'AI extraction completed', clinician: 'Dr. Priya Sharma', patient: 'Arun Kumar (CT-2026-00124)', status: 'complete' },
                  { time: '09:15', event: 'Prescription dispensed', clinician: 'Pharm. Rajan', patient: 'Meena Devi (CT-2026-00097)', status: 'complete' },
                  { time: '09:10', event: 'Tamil instructions generated', clinician: 'Dr. Arjun Reddy', patient: 'Sundaram P. (CT-2026-00098)', status: 'complete' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'var(--ct-font-mono)', fontSize: '12px' }}>{row.time}</td>
                    <td style={{ color: 'var(--ct-text-primary)' }}>{row.event}</td>
                    <td>{row.clinician}</td>
                    <td style={{ fontSize: '12px', color: 'var(--ct-text-secondary)' }}>{row.patient}</td>
                    <td>
                      <span className={`ct-badge ${row.status === 'complete' ? 'ct-badge-green' : 'ct-badge-amber'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
