'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DoctorShell } from '@/components/shell/DoctorShell';
import { DEMO_PATIENTS } from '@/data/demoPatients';
import type { UserRole } from '@/types/clinical';

type QueueStatus = 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'SKIPPED';

interface QueueEntry {
  tokenNo: number;
  patient: typeof DEMO_PATIENTS[0];
  status: QueueStatus;
  waitingMins: number;
  arrivalTime: string;
  urgency: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
}

const DEMO_QUEUE: QueueEntry[] = [
  { tokenNo: 1,  patient: DEMO_PATIENTS[0], status: 'COMPLETED',       waitingMins: 0,  arrivalTime: '08:05', urgency: 'ROUTINE' },
  { tokenNo: 2,  patient: DEMO_PATIENTS[1], status: 'IN_CONSULTATION', waitingMins: 4,  arrivalTime: '08:22', urgency: 'ROUTINE' },
  { tokenNo: 3,  patient: { ...DEMO_PATIENTS[0], id: 'CT-2026-00131', name: 'Ramesh Babu',    age: 62, conditions: ['COPD'], currentMedications: [], allergies: [], mrn: 'MRN-RB-131' }, status: 'WAITING', waitingMins: 18, arrivalTime: '08:35', urgency: 'ROUTINE' },
  { tokenNo: 4,  patient: { ...DEMO_PATIENTS[0], id: 'CT-2026-00132', name: 'Lakshmi Devi',   age: 45, conditions: ['Hypothyroidism'], currentMedications: [], allergies: ['Penicillin'], mrn: 'MRN-LD-132' }, status: 'WAITING', waitingMins: 22, arrivalTime: '08:42', urgency: 'ROUTINE' },
  { tokenNo: 5,  patient: { ...DEMO_PATIENTS[0], id: 'CT-2026-00133', name: 'Suresh Patel',   age: 71, conditions: ['Coronary Artery Disease', 'Type 2 Diabetes Mellitus'], currentMedications: [], allergies: [], mrn: 'MRN-SP-133' }, status: 'WAITING', waitingMins: 28, arrivalTime: '08:51', urgency: 'URGENT' },
  { tokenNo: 6,  patient: { ...DEMO_PATIENTS[0], id: 'CT-2026-00134', name: 'Preethi Raj',    age: 29, conditions: [], currentMedications: [], allergies: [], mrn: 'MRN-PR-134' }, status: 'WAITING', waitingMins: 35, arrivalTime: '09:02', urgency: 'ROUTINE' },
  { tokenNo: 7,  patient: { ...DEMO_PATIENTS[0], id: 'CT-2026-00135', name: 'Mohammed Irfan', age: 55, conditions: ['Hypertension', 'CKD Stage 2'], currentMedications: [], allergies: [], mrn: 'MRN-MI-135' }, status: 'WAITING', waitingMins: 40, arrivalTime: '09:14', urgency: 'URGENT' },
  { tokenNo: 8,  patient: { ...DEMO_PATIENTS[0], id: 'CT-2026-00136', name: 'Geetha Nair',    age: 48, conditions: ['Asthma'], currentMedications: [], allergies: ['Aspirin'], mrn: 'MRN-GN-136' }, status: 'WAITING', waitingMins: 46, arrivalTime: '09:20', urgency: 'ROUTINE' },
];

const STATUS_COLORS: Record<QueueStatus, { bg: string; border: string; text: string; label: string }> = {
  WAITING:         { bg: 'var(--ct-amber-light)',  border: 'var(--ct-amber-border)',  text: 'var(--ct-amber)',  label: 'Waiting' },
  IN_CONSULTATION: { bg: 'var(--ct-blue-light)',   border: 'var(--ct-blue-mid)',      text: 'var(--ct-blue)',   label: 'In Consultation' },
  COMPLETED:       { bg: 'var(--ct-green-light)',  border: 'var(--ct-green-border)',  text: 'var(--ct-green)',  label: 'Completed' },
  SKIPPED:         { bg: 'var(--ct-bg)',           border: 'var(--ct-border)',        text: 'var(--ct-text-muted)', label: 'Skipped' },
};

export default function QueuePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: UserRole; unit: string } | null>(null);
  const [queue, setQueue] = useState<QueueEntry[]>(DEMO_QUEUE);

  useEffect(() => {
    const stored = sessionStorage.getItem('ct_user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'doctor') { router.push(`/${u.role}`); return; }
    setUser(u);
  }, [router]);

  if (!user) return <div style={{ padding: '40px', color: 'var(--ct-text-muted)' }}>Loading…</div>;

  const waiting = queue.filter(q => q.status === 'WAITING').length;
  const inConsultation = queue.filter(q => q.status === 'IN_CONSULTATION').length;
  const completed = queue.filter(q => q.status === 'COMPLETED').length;

  const callNext = (token: number) => {
    setQueue(prev => prev.map(q => {
      if (q.tokenNo === token) return { ...q, status: 'IN_CONSULTATION' };
      if (q.status === 'IN_CONSULTATION') return { ...q, status: 'COMPLETED' };
      return q;
    }));
  };

  return (
    <DoctorShell active="queue" user={user}>
      <div style={{ padding: '16px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h1 className="ct-text-head-lg" style={{ marginBottom: '2px' }}>OPD Queue</h1>
            <span className="ct-text-body ct-muted">General Medicine · Morning Session · {new Date().toLocaleDateString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { label: 'Waiting', value: waiting, color: 'var(--ct-amber)' },
              { label: 'In Consultation', value: inConsultation, color: 'var(--ct-blue)' },
              { label: 'Completed', value: completed, color: 'var(--ct-green)' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '10px 16px', background: 'var(--ct-surface)', border: '1px solid var(--ct-border)', borderRadius: 'var(--ct-radius-md)' }}>
                <div style={{ fontSize: '22px', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div className="ct-text-label ct-muted" style={{ marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Queue table */}
        <div style={{ background: 'var(--ct-surface)', border: '1px solid var(--ct-border)', borderRadius: 'var(--ct-radius-md)', overflow: 'hidden' }}>
          <table className="ct-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Token</th>
                <th>Patient</th>
                <th>Conditions</th>
                <th>Allergies</th>
                <th>Arrival</th>
                <th>Wait</th>
                <th>Urgency</th>
                <th>Status</th>
                <th style={{ width: '120px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((entry) => {
                const sc = STATUS_COLORS[entry.status];
                return (
                  <tr key={entry.tokenNo} style={{ opacity: entry.status === 'SKIPPED' ? 0.5 : 1 }}>
                    <td>
                      <span style={{ fontFamily: 'var(--ct-font-mono)', fontWeight: 700, fontSize: '14px', color: 'var(--ct-blue)' }}>
                        #{entry.tokenNo.toString().padStart(2, '0')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--ct-text-primary)' }}>{entry.patient.name}</div>
                      <div className="ct-text-body-sm ct-muted">{entry.patient.age}yr · {entry.patient.sex} · {entry.patient.id}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {entry.patient.conditions.length === 0
                          ? <span className="ct-badge ct-badge-green">None</span>
                          : entry.patient.conditions.map(c => <span key={c} className="ct-badge ct-badge-amber">{c}</span>)
                        }
                      </div>
                    </td>
                    <td>
                      {entry.patient.allergies.length === 0
                        ? <span className="ct-text-body-sm ct-muted">None known</span>
                        : entry.patient.allergies.map(a => <span key={a} className="ct-badge ct-badge-red" style={{ marginRight: '4px' }}>{a}</span>)
                      }
                    </td>
                    <td><span style={{ fontFamily: 'var(--ct-font-mono)', fontSize: '12px' }}>{entry.arrivalTime}</span></td>
                    <td>
                      {entry.status === 'WAITING'
                        ? <span style={{ fontFamily: 'var(--ct-font-mono)', fontSize: '12px', color: 'var(--ct-amber)' }}>{entry.waitingMins}m</span>
                        : <span className="ct-text-muted" style={{ fontSize: '12px' }}>—</span>
                      }
                    </td>
                    <td>
                      <span className={`ct-badge ${entry.urgency === 'EMERGENCY' ? 'ct-badge-red' : entry.urgency === 'URGENT' ? 'ct-badge-amber' : 'ct-badge-gray'}`}>
                        {entry.urgency}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', padding: '3px 8px',
                        background: sc.bg, border: `1px solid ${sc.border}`,
                        borderRadius: 'var(--ct-radius)', fontSize: '11px', fontWeight: 600, color: sc.text,
                      }}>
                        {sc.label}
                      </span>
                    </td>
                    <td>
                      {entry.status === 'WAITING' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="ct-btn ct-btn-primary ct-btn-sm"
                            onClick={() => {
                              callNext(entry.tokenNo);
                              router.push('/doctor');
                            }}
                            style={{ fontSize: '11px', padding: '4px 10px' }}
                          >
                            Start
                          </button>
                        </div>
                      )}
                      {entry.status === 'IN_CONSULTATION' && (
                        <span className="ct-text-body-sm" style={{ color: 'var(--ct-blue)', fontWeight: 600 }}>Active</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DoctorShell>
  );
}
