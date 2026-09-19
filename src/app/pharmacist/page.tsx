'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_EXTRACTED_MEDICATIONS } from '@/data/demoPatients';
import { DEMO_PATIENTS } from '@/data/demoPatients';

export default function PharmacistPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; unit: string } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('ct_user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    setUser(u);
  }, [router]);

  const patient = DEMO_PATIENTS[0];

  return (
    <div className="ct-shell">
      {/* Nav */}
      <nav className="ct-nav-rail">
        <div style={{ padding: '8px 4px', marginBottom: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'var(--ct-blue)', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M7 3h2v3h3v2h-3v3H7v-3H4V6h3z" fill="white"/></svg>
          </div>
        </div>
        {['💊', '📋', '✓'].map((icon, i) => (
          <button key={i} className={`ct-nav-item${i === 0 ? ' active' : ''}`} title={['Dispensing', 'Queue', 'Verified'][i]}>
            <span style={{ fontSize: '16px' }}>{icon}</span>
          </button>
        ))}
      </nav>

      {/* Header */}
      <header className="ct-header">
        <div style={{ flex: 1 }}>
          <span className="ct-text-label ct-muted">Pharmacy Dispensing</span>
          <span style={{ margin: '0 8px', color: 'var(--ct-border)' }}>·</span>
          <span className="ct-badge ct-badge-blue">Central Pharmacy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="ct-text-ui">{user?.name}</span>
          <span className="ct-badge ct-badge-gray">Pharmacist</span>
        </div>
      </header>

      <main className="ct-main">
        <div className="ct-demo-banner">
          Demo Mode — Bharat Build Hackathon 2026 · Pharmacist view shows dispensing-relevant data only
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 className="ct-text-head-lg">Dispensing Queue</h1>
            <button className="ct-btn ct-btn-secondary ct-btn-sm">Refresh</button>
          </div>

          {/* Prescription card */}
          <div className="ct-panel">
            <div className="ct-panel-header">
              <div>
                <span className="ct-text-head-sm">Prescription — Authorized</span>
                <span className="ct-badge ct-badge-green" style={{ marginLeft: '8px' }}>✓ Clinician Authorized</span>
              </div>
              <span className="ct-text-label ct-muted">Today · {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {/* Patient info — limited for pharmacist */}
            <div style={{ padding: '12px 14px', background: 'var(--ct-bg)', borderBottom: '1px solid var(--ct-border-subtle)', display: 'flex', gap: '20px' }}>
              <div className="ct-field">
                <span className="ct-field-label">Patient Name</span>
                <span className="ct-field-value">{patient.name}</span>
              </div>
              <div className="ct-field">
                <span className="ct-field-label">Patient ID</span>
                <span className="ct-field-value mono">{patient.id}</span>
              </div>
              <div className="ct-field">
                <span className="ct-field-label">Age / Sex</span>
                <span className="ct-field-value">{patient.age} yr · {patient.sex}</span>
              </div>
              <div className="ct-field">
                <span className="ct-field-label">Allergies</span>
                <span className="ct-field-value" style={{ color: 'var(--ct-green)' }}>NKDA</span>
              </div>
            </div>

            {/* Medications table */}
            <div>
              <table className="ct-table">
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Strength</th>
                    <th>Frequency</th>
                    <th>Route</th>
                    <th>Duration</th>
                    <th>Qty</th>
                    <th>Safety</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_EXTRACTED_MEDICATIONS.map((med) => (
                    <tr key={med.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--ct-text-primary)' }}>{med.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--ct-text-muted)' }}>{med.genericName}</div>
                      </td>
                      <td style={{ fontFamily: 'var(--ct-font-mono)' }}>{med.strength}</td>
                      <td><span className="ct-badge ct-badge-blue">{med.frequency}</span></td>
                      <td>{med.route}</td>
                      <td>{med.duration ?? '—'}</td>
                      <td style={{ fontWeight: 600 }}>
                        {med.frequency === 'TDS' ? '—' : med.frequency === 'OD' ? med.duration?.includes('3') ? '3' : med.duration?.includes('5') ? '5' : '30' : '60'}
                      </td>
                      <td>
                        <span className="ct-badge ct-badge-amber">⚠ DDI — Reviewed</span>
                      </td>
                      <td>
                        <button className="ct-btn ct-btn-primary ct-btn-sm">Dispense</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Safety note for pharmacist */}
            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--ct-border-subtle)', background: 'var(--ct-amber-light)' }}>
              <p className="ct-text-body-sm" style={{ color: 'var(--ct-amber)' }}>
                <strong>Safety note:</strong> Clinician has acknowledged a Moderate DDI (Atenolol + Salbutamol, BNF 86) and authorized this prescription.
                Counsel patient on Prednisolone — do not stop abruptly.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
