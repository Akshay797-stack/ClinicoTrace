'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_EXTRACTED_MEDICATIONS } from '@/data/demoPatients';
import { DEMO_PATIENTS } from '@/data/demoPatients';

const SCHEDULE_TIMES = ['06:00', '10:00', '14:00', '18:00', '22:00'];

export default function NursePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; unit: string } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('ct_user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    setUser(u);
  }, [router]);

  const patient = DEMO_PATIENTS[0];

  // Build administration schedule from medications
  const schedule = [
    { time: '08:00', medication: 'Salbutamol 2.5mg Nebulisation', route: 'Nebulisation', notes: 'Monitor SpO2 before and after. Contact doctor if SpO2 < 94%.', due: true },
    { time: '08:00', medication: 'Prednisolone 30mg', route: 'Oral', notes: 'Give with food.', due: true },
    { time: '08:00', medication: 'Azithromycin 500mg', route: 'Oral', notes: '1 hour before food.', due: true },
    { time: '14:00', medication: 'Salbutamol 2.5mg Nebulisation', route: 'Nebulisation', notes: 'Monitor SpO2.', due: false },
    { time: '20:00', medication: 'Salbutamol 2.5mg Nebulisation', route: 'Nebulisation', notes: 'Monitor SpO2.', due: false },
  ];

  return (
    <div className="ct-shell">
      <nav className="ct-nav-rail">
        <div style={{ padding: '8px 4px', marginBottom: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'var(--ct-blue)', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M7 3h2v3h3v2h-3v3H7v-3H4V6h3z" fill="white"/></svg>
          </div>
        </div>
        {['👤', '🗓', '✓'].map((icon, i) => (
          <button key={i} className={`ct-nav-item${i === 1 ? ' active' : ''}`}>
            <span style={{ fontSize: '16px' }}>{icon}</span>
          </button>
        ))}
      </nav>

      <header className="ct-header">
        <div style={{ flex: 1 }}>
          <span className="ct-text-label ct-muted">Nursing Administration</span>
          <span style={{ margin: '0 8px', color: 'var(--ct-border)' }}>·</span>
          <span className="ct-badge ct-badge-blue">Ward B</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="ct-text-ui">{user?.name}</span>
          <span className="ct-badge ct-badge-gray">Nurse</span>
        </div>
      </header>

      <main className="ct-main">
        <div className="ct-demo-banner">
          Demo Mode — Bharat Build Hackathon 2026 · Nurse view — administration schedule only
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h1 className="ct-text-head-lg">Administration Schedule</h1>

          {/* Patient brief */}
          <div className="ct-panel">
            <div className="ct-panel-header">
              <span className="ct-text-head-sm">{patient.name} — {patient.id}</span>
              <span className="ct-badge ct-badge-blue">{patient.age} yr · {patient.sex} · Ward B, Bed 12</span>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', gap: '20px' }}>
              <div className="ct-field">
                <span className="ct-field-label">Condition</span>
                <span className="ct-field-value">Acute Bronchospasm (HTN background)</span>
              </div>
              <div className="ct-field">
                <span className="ct-field-label">Allergies</span>
                <span className="ct-field-value" style={{ color: 'var(--ct-green)' }}>NKDA</span>
              </div>
              <div className="ct-field">
                <span className="ct-field-label">Prescription status</span>
                <span className="ct-badge ct-badge-green">✓ Authorized</span>
              </div>
            </div>
          </div>

          {/* Nursing note */}
          <div className="ct-alert ct-alert-amber" style={{ fontSize: '12px' }}>
            <strong>Clinical note:</strong> Patient is on Atenolol (antihypertensive). Clinician has reviewed and acknowledged Atenolol + Salbutamol interaction (BNF 86). Monitor blood pressure and respiratory response closely after nebulisation.
          </div>

          {/* Schedule table */}
          <div className="ct-panel">
            <div className="ct-panel-header">
              <span className="ct-text-head-sm">Today's Administration Schedule</span>
              <span className="ct-text-label ct-muted">{new Date().toLocaleDateString('en-IN')}</span>
            </div>
            <table className="ct-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Medication</th>
                  <th>Route</th>
                  <th>Nursing Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((s, i) => (
                  <tr key={i}>
                    <td>
                      <span style={{ fontFamily: 'var(--ct-font-mono)', fontWeight: 600, color: s.due ? 'var(--ct-blue)' : 'var(--ct-text-muted)' }}>
                        {s.time}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--ct-text-primary)' }}>{s.medication}</td>
                    <td>{s.route}</td>
                    <td style={{ maxWidth: '240px', fontSize: '12px', color: 'var(--ct-text-secondary)' }}>{s.notes}</td>
                    <td>
                      {s.due
                        ? <span className="ct-badge ct-badge-blue">Due</span>
                        : <span className="ct-badge ct-badge-gray">Scheduled</span>}
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
