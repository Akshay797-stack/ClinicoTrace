'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DoctorShell } from '@/components/shell/DoctorShell';
import { PatientInstructionsPanel } from '@/components/workstation/PatientInstructionsPanel';
import { DEMO_PATIENTS, DEMO_EXTRACTED_MEDICATIONS } from '@/data/demoPatients';
import type { UserRole, Medication } from '@/types/clinical';

interface DemoPrescription {
  rxId: string;
  patientId: string;
  patientName: string;
  age: number;
  sex: string;
  date: string;
  authorizedBy: string;
  status: 'AUTHORIZED' | 'DISPENSED' | 'PENDING';
  medications: Medication[];
  safetyStatus: 'clear' | 'warning' | 'critical';
  findingCount: number;
}

const DEMO_PRESCRIPTIONS: DemoPrescription[] = [
  {
    rxId: 'RX-2026-00892',
    patientId: 'CT-2026-00124',
    patientName: 'Arun Kumar',
    age: 54, sex: 'M',
    date: new Date().toLocaleDateString('en-IN'),
    authorizedBy: 'Dr. Priya Sharma',
    status: 'AUTHORIZED',
    medications: DEMO_EXTRACTED_MEDICATIONS as unknown as Medication[],
    safetyStatus: 'warning',
    findingCount: 1,
  },
  {
    rxId: 'RX-2026-00891',
    patientId: 'CT-2026-00097',
    patientName: 'Meena Devi',
    age: 38, sex: 'F',
    date: new Date().toLocaleDateString('en-IN'),
    authorizedBy: 'Dr. Priya Sharma',
    status: 'DISPENSED',
    medications: [
      { id: 'm-p1', name: 'Paracetamol', genericName: 'paracetamol', strength: '500mg', dose: '500mg', frequency: 'TDS', route: 'Oral', timing: 'After food', duration: '5 days', instructions: 'Take with water', extractionConfidence: 0.98, requiresVerification: false },
      { id: 'm-p2', name: 'Cetirizine',  genericName: 'cetirizine',  strength: '10mg',  dose: '10mg',  frequency: 'OD',  route: 'Oral', timing: 'Night',      duration: '5 days', instructions: 'May cause drowsiness', extractionConfidence: 0.97, requiresVerification: false },
    ] as Medication[],
    safetyStatus: 'clear',
    findingCount: 0,
  },
];

export default function RxPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: UserRole; unit: string } | null>(null);
  const [selected, setSelected] = useState<DemoPrescription | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('ct_user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'doctor') { router.push(`/${u.role}`); return; }
    setUser(u);
  }, [router]);

  if (!user) return <div style={{ padding: '40px', color: 'var(--ct-text-muted)' }}>Loading…</div>;

  return (
    <DoctorShell active="rx" user={user}>
      <div style={{ padding: '16px 20px', height: 'calc(100vh - var(--ct-header-height) - 29px)', display: 'flex', gap: '16px', overflow: 'hidden' }}>
        {/* Left: Prescription list */}
        <div style={{ width: '420px', flexShrink: 0, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h1 className="ct-text-head" style={{ marginBottom: 0 }}>Prescriptions</h1>
            <span className="ct-badge ct-badge-blue">{DEMO_PRESCRIPTIONS.length} today</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {DEMO_PRESCRIPTIONS.map(rx => {
              const isSelected = selected?.rxId === rx.rxId;
              return (
                <div
                  key={rx.rxId}
                  onClick={() => { setSelected(rx); setShowInstructions(false); }}
                  style={{
                    padding: '12px 14px',
                    background: isSelected ? 'var(--ct-blue-light)' : 'var(--ct-surface)',
                    border: `1px solid ${isSelected ? 'var(--ct-blue)' : 'var(--ct-border)'}`,
                    borderRadius: 'var(--ct-radius-md)', cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'var(--ct-font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--ct-blue)' }}>{rx.rxId}</span>
                    <span className={`ct-badge ${rx.status === 'DISPENSED' ? 'ct-badge-green' : rx.status === 'AUTHORIZED' ? 'ct-badge-blue' : 'ct-badge-amber'}`}>
                      {rx.status}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--ct-text-primary)', marginBottom: '2px' }}>{rx.patientName}</div>
                  <div className="ct-text-body-sm ct-muted" style={{ marginBottom: '6px' }}>
                    {rx.age}yr · {rx.sex} · {rx.patientId}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className={`ct-badge ${rx.safetyStatus === 'clear' ? 'ct-badge-green' : 'ct-badge-amber'}`}>
                      Safety: {rx.safetyStatus === 'clear' ? 'Clear' : `${rx.findingCount} finding${rx.findingCount > 1 ? 's' : ''}`}
                    </span>
                    <span className="ct-badge ct-badge-gray">{rx.medications.length} med{rx.medications.length > 1 ? 's' : ''}</span>
                    <span className="ct-text-label ct-muted">{rx.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Prescription detail or instructions */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!selected ? (
            <div className="ct-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <p className="ct-text-body ct-muted">Select a prescription to view details</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Tab switcher */}
              <div style={{ display: 'flex', gap: '4px', background: 'var(--ct-bg-alt)', padding: '3px', borderRadius: 'var(--ct-radius)', border: '1px solid var(--ct-border)', width: 'fit-content' }}>
                {['Details', 'Patient Instructions'].map(tab => {
                  const active = (tab === 'Patient Instructions') === showInstructions;
                  return (
                    <button
                      key={tab}
                      onClick={() => setShowInstructions(tab === 'Patient Instructions')}
                      style={{
                        padding: '5px 14px', fontSize: '11px', fontWeight: 600,
                        borderRadius: '4px', border: 'none', cursor: 'pointer',
                        background: active ? 'var(--ct-surface)' : 'transparent',
                        color: active ? 'var(--ct-blue)' : 'var(--ct-text-muted)',
                        boxShadow: active ? 'var(--ct-shadow-xs)' : 'none',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                      }}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {!showInstructions ? (
                <div className="ct-panel">
                  <div className="ct-panel-header">
                    <span className="ct-text-head-sm">{selected.rxId}</span>
                    <span className={`ct-badge ${selected.status === 'DISPENSED' ? 'ct-badge-green' : 'ct-badge-blue'}`}>{selected.status}</span>
                  </div>
                  <div className="ct-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      {[
                        { label: 'Patient', value: selected.patientName },
                        { label: 'Patient ID', value: selected.patientId },
                        { label: 'Date', value: selected.date },
                        { label: 'Authorized by', value: selected.authorizedBy },
                        { label: 'Safety Status', value: selected.safetyStatus === 'clear' ? 'Clear' : `${selected.findingCount} finding(s) — reviewed` },
                        { label: 'Medications', value: `${selected.medications.length} prescribed` },
                      ].map(f => (
                        <div key={f.label} className="ct-field">
                          <span className="ct-field-label">{f.label}</span>
                          <span className="ct-field-value">{f.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="ct-divider" />
                    <div className="ct-field-label" style={{ marginBottom: '6px' }}>Prescribed Medications</div>
                    <div style={{ background: 'var(--ct-bg)', border: '1px solid var(--ct-border-subtle)', borderRadius: 'var(--ct-radius)', overflow: 'hidden' }}>
                      <table className="ct-table" style={{ width: '100%' }}>
                        <thead>
                          <tr>
                            <th>Medication</th>
                            <th>Strength</th>
                            <th>Frequency</th>
                            <th>Route</th>
                            <th>Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.medications.map(med => (
                            <tr key={med.id}>
                              <td style={{ fontWeight: 600, color: 'var(--ct-text-primary)' }}>
                                {med.name}
                                <div className="ct-text-body-sm ct-muted">({med.genericName})</div>
                              </td>
                              <td>{med.strength}</td>
                              <td>{med.frequency}</td>
                              <td>{med.route}</td>
                              <td>{med.duration ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="ct-btn ct-btn-secondary ct-btn-sm" onClick={() => setShowInstructions(true)}>
                        View Patient Instructions
                      </button>
                      <button className="ct-btn ct-btn-ghost ct-btn-sm">Print Prescription</button>
                    </div>
                  </div>
                </div>
              ) : (
                <PatientInstructionsPanel
                  patient={DEMO_PATIENTS.find(p => p.id === selected.patientId) ?? DEMO_PATIENTS[0]}
                  medications={selected.medications}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </DoctorShell>
  );
}
