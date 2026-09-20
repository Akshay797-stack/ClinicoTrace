'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DoctorShell } from '@/components/shell/DoctorShell';
import { DEMO_EXTRACTED_MEDICATIONS } from '@/data/demoPatients';
import type { UserRole, Medication } from '@/types/clinical';

interface HistoryEntry {
  date: string;
  time: string;
  patientId: string;
  patientName: string;
  age: number;
  sex: string;
  rxId: string;
  status: string;
  safetyStatus: 'clear' | 'warning';
  findingCount: number;
  medications: Medication[];
  authorizedBy: string;
  sessionType: string;
}

const mkMed = (id: string, name: string, gen: string, str: string, dose: string, freq: string, route: Medication['route'], timing: string, duration: string, instructions: string): Medication => ({
  id, name, genericName: gen, strength: str, dose, frequency: freq, route, timing, duration, instructions, extractionConfidence: 0.97, requiresVerification: false,
});

const DEMO_HISTORY: HistoryEntry[] = [
  {
    date: new Date().toLocaleDateString('en-IN'), time: '09:14',
    patientId: 'CT-2026-00124', patientName: 'Arun Kumar', age: 54, sex: 'M',
    rxId: 'RX-2026-00892', status: 'AUTHORIZED', safetyStatus: 'warning', findingCount: 1,
    medications: DEMO_EXTRACTED_MEDICATIONS as unknown as Medication[],
    authorizedBy: 'Dr. Priya Sharma', sessionType: 'OPD',
  },
  {
    date: new Date().toLocaleDateString('en-IN'), time: '08:42',
    patientId: 'CT-2026-00097', patientName: 'Meena Devi', age: 38, sex: 'F',
    rxId: 'RX-2026-00891', status: 'DISPENSED', safetyStatus: 'clear', findingCount: 0,
    medications: [
      mkMed('p1', 'Paracetamol', 'paracetamol', '500mg', '500mg', 'TDS', 'Oral', 'After food', '5 days', 'With water'),
      mkMed('p2', 'Cetirizine', 'cetirizine', '10mg', '10mg', 'OD', 'Oral', 'Night', '5 days', 'May cause drowsiness'),
    ],
    authorizedBy: 'Dr. Priya Sharma', sessionType: 'OPD',
  },
  {
    date: new Date(Date.now() - 86400000).toLocaleDateString('en-IN'), time: '10:22',
    patientId: 'CT-2026-00131', patientName: 'Ramesh Babu', age: 62, sex: 'M',
    rxId: 'RX-2026-00878', status: 'DISPENSED', safetyStatus: 'clear', findingCount: 0,
    medications: [
      mkMed('s1', 'Salbutamol', 'salbutamol', '2.5mg', '2.5mg', 'TDS', 'Nebulisation', 'SOS', '7 days', 'Use nebulizer'),
    ],
    authorizedBy: 'Dr. Priya Sharma', sessionType: 'OPD',
  },
  {
    date: new Date(Date.now() - 86400000).toLocaleDateString('en-IN'), time: '09:05',
    patientId: 'CT-2026-00132', patientName: 'Lakshmi Devi', age: 45, sex: 'F',
    rxId: 'RX-2026-00877', status: 'DISPENSED', safetyStatus: 'clear', findingCount: 0,
    medications: [
      mkMed('l1', 'Levothyroxine', 'levothyroxine', '50mcg', '50mcg', 'OD', 'Oral', 'Morning empty stomach', '30 days', '30 min before food'),
    ],
    authorizedBy: 'Dr. Priya Sharma', sessionType: 'OPD',
  },
  {
    date: new Date(Date.now() - 172800000).toLocaleDateString('en-IN'), time: '11:30',
    patientId: 'CT-2026-00133', patientName: 'Suresh Patel', age: 71, sex: 'M',
    rxId: 'RX-2026-00860', status: 'DISPENSED', safetyStatus: 'warning', findingCount: 2,
    medications: DEMO_EXTRACTED_MEDICATIONS as unknown as Medication[],
    authorizedBy: 'Dr. Priya Sharma', sessionType: 'OPD',
  },
];

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: UserRole; unit: string } | null>(null);
  const [selected, setSelected] = useState<HistoryEntry | null>(null);
  const [filterDate, setFilterDate] = useState<string>('all');

  useEffect(() => {
    const stored = sessionStorage.getItem('ct_user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'doctor') { router.push(`/${u.role}`); return; }
    setUser(u);
  }, [router]);

  if (!user) return <div style={{ padding: '40px', color: 'var(--ct-text-muted)' }}>Loading…</div>;

  const uniqueDates = Array.from(new Set(DEMO_HISTORY.map(h => h.date)));
  const filtered = filterDate === 'all' ? DEMO_HISTORY : DEMO_HISTORY.filter(h => h.date === filterDate);

  return (
    <DoctorShell active="history" user={user}>
      <div style={{ padding: '16px 20px', height: 'calc(100vh - var(--ct-header-height) - 29px)', display: 'flex', gap: '16px', overflow: 'hidden' }}>
        {/* Left: History list */}
        <div style={{ width: '420px', flexShrink: 0, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h1 className="ct-text-head" style={{ marginBottom: 0 }}>Consultation History</h1>
          </div>

          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <button className={`ct-btn ct-btn-sm ${filterDate === 'all' ? 'ct-btn-secondary' : 'ct-btn-ghost'}`} onClick={() => setFilterDate('all')}>All</button>
            {uniqueDates.map(d => (
              <button key={d} className={`ct-btn ct-btn-sm ${filterDate === d ? 'ct-btn-secondary' : 'ct-btn-ghost'}`} onClick={() => setFilterDate(d)}>{d}</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filtered.map(entry => {
              const isSelected = selected?.rxId === entry.rxId;
              return (
                <div
                  key={entry.rxId}
                  onClick={() => setSelected(entry)}
                  style={{
                    padding: '10px 12px',
                    background: isSelected ? 'var(--ct-blue-light)' : 'var(--ct-surface)',
                    border: `1px solid ${isSelected ? 'var(--ct-blue)' : 'var(--ct-border)'}`,
                    borderRadius: 'var(--ct-radius-md)', cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--ct-font-mono)', fontSize: '11px', color: 'var(--ct-blue)', fontWeight: 700 }}>{entry.rxId}</span>
                    <span className="ct-text-label ct-muted">{entry.date} · {entry.time}</span>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--ct-text-primary)', marginBottom: '2px' }}>{entry.patientName}</div>
                  <div className="ct-text-body-sm ct-muted" style={{ marginBottom: '6px' }}>{entry.age}yr · {entry.sex} · {entry.sessionType}</div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className={`ct-badge ${entry.safetyStatus === 'clear' ? 'ct-badge-green' : 'ct-badge-amber'}`}>
                      {entry.safetyStatus === 'clear' ? '✓ Clear' : `⚠ ${entry.findingCount} finding(s)`}
                    </span>
                    <span className="ct-badge ct-badge-gray">{entry.medications.length} med{entry.medications.length > 1 ? 's' : ''}</span>
                    <span className={`ct-badge ${entry.status === 'DISPENSED' ? 'ct-badge-green' : 'ct-badge-blue'}`}>{entry.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detail */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!selected ? (
            <div className="ct-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <p className="ct-text-body ct-muted">Select a consultation to view details</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="ct-panel">
                <div className="ct-panel-header">
                  <div>
                    <span className="ct-text-head-sm">{selected.patientName}</span>
                    <span className="ct-text-body-sm ct-muted" style={{ marginLeft: '8px' }}>{selected.patientId}</span>
                  </div>
                  <span className="ct-text-label ct-muted">{selected.date} at {selected.time}</span>
                </div>
                <div className="ct-panel-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    {[
                      { label: 'Prescription ID', value: selected.rxId },
                      { label: 'Authorized by', value: selected.authorizedBy },
                      { label: 'Status', value: selected.status },
                      { label: 'Safety', value: selected.safetyStatus === 'clear' ? 'Clear — no findings' : `${selected.findingCount} finding(s) reviewed` },
                      { label: 'Session', value: selected.sessionType },
                      { label: 'Medications', value: `${selected.medications.length} prescribed` },
                    ].map(f => (
                      <div key={f.label} className="ct-field">
                        <span className="ct-field-label">{f.label}</span>
                        <span className="ct-field-value">{f.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="ct-divider" />
                  <div className="ct-field-label" style={{ margin: '10px 0 6px' }}>Medications Prescribed</div>
                  <div style={{ background: 'var(--ct-bg)', border: '1px solid var(--ct-border-subtle)', borderRadius: 'var(--ct-radius)', overflow: 'hidden' }}>
                    <table className="ct-table" style={{ width: '100%' }}>
                      <thead>
                        <tr><th>Medication</th><th>Strength</th><th>Frequency</th><th>Route</th><th>Duration</th></tr>
                      </thead>
                      <tbody>
                        {selected.medications.map(m => (
                          <tr key={m.id}>
                            <td style={{ fontWeight: 600, color: 'var(--ct-text-primary)' }}>
                              {m.name}<div className="ct-text-body-sm ct-muted">({m.genericName})</div>
                            </td>
                            <td>{m.strength}</td>
                            <td>{m.frequency}</td>
                            <td>{m.route}</td>
                            <td>{m.duration ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {selected.safetyStatus === 'warning' && (
                    <div className="ct-alert ct-alert-amber" style={{ marginTop: '12px' }}>
                      <strong>{selected.findingCount} safety finding(s)</strong> were reviewed and acknowledged by {selected.authorizedBy} before authorization.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DoctorShell>
  );
}
