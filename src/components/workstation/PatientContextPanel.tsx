'use client';

// ============================================================
// ClinicoTrace — PatientContextPanel
// Extracted from doctor/page.tsx (Stage 1 refactor).
// No behavior change. Identical rendering.
// ============================================================

import type { Patient } from '@/types/clinical';

export function PatientContextPanel({ patient }: { patient: Patient }) {
  return (
    <div className="ct-panel" style={{ height: '100%' }}>
      <div className="ct-panel-header">
        <span className="ct-text-head-sm">Patient</span>
        <span className="ct-badge ct-badge-blue">{patient.id}</span>
      </div>
      <div className="ct-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Demographics */}
        <div>
          <div className="ct-field-label" style={{ marginBottom: '6px' }}>Demographics</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
            <div className="ct-field">
              <span className="ct-field-label">Name</span>
              <span className="ct-field-value">{patient.name}</span>
            </div>
            <div className="ct-field">
              <span className="ct-field-label">Age / Sex</span>
              <span className="ct-field-value">{patient.age} yr · {patient.sex}</span>
            </div>
            <div className="ct-field">
              <span className="ct-field-label">Blood Group</span>
              <span className="ct-field-value">{patient.bloodGroup ?? '—'}</span>
            </div>
            <div className="ct-field">
              <span className="ct-field-label">Weight</span>
              <span className="ct-field-value">{patient.weight ? `${patient.weight} kg` : '—'}</span>
            </div>
          </div>
        </div>

        <div className="ct-divider" />

        {/* Conditions */}
        <div>
          <div className="ct-field-label" style={{ marginBottom: '6px' }}>Active Conditions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {patient.conditions.map((c) => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="ct-status-dot amber" />
                <span className="ct-text-body" style={{ color: 'var(--ct-text-secondary)' }}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ct-divider" />

        {/* Allergies */}
        <div>
          <div className="ct-field-label" style={{ marginBottom: '6px' }}>Drug Allergies</div>
          {patient.allergies.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ color: 'var(--ct-green)', flexShrink: 0 }}>
                <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M4 6.5l1.8 1.8 3.2-3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="ct-text-body-sm" style={{ color: 'var(--ct-green)' }}>No known drug allergies</span>
            </div>
          ) : (
            patient.allergies.map((a) => (
              <span key={a} className="ct-badge ct-badge-red" style={{ marginRight: '4px' }}>{a}</span>
            ))
          )}
        </div>

        <div className="ct-divider" />

        {/* Current Medications */}
        <div>
          <div className="ct-field-label" style={{ marginBottom: '6px' }}>Current Medications</div>
          {patient.currentMedications.length === 0 ? (
            <span className="ct-text-body-sm ct-muted">None on record</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {patient.currentMedications.map((med, i) => (
                <div key={i} style={{
                  padding: '8px 10px', background: 'var(--ct-bg)',
                  border: '1px solid var(--ct-border-subtle)', borderRadius: 'var(--ct-radius)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span className="ct-text-body" style={{ fontWeight: 600, color: 'var(--ct-text-primary)' }}>
                      {med.name} {med.strength}
                    </span>
                    <span className="ct-badge ct-badge-gray">{med.frequency}</span>
                  </div>
                  <span className="ct-text-body-sm ct-muted">{med.prescribedFor} · {med.route}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ct-divider" />

        {/* MRN */}
        <div className="ct-field">
          <span className="ct-field-label">MRN</span>
          <span className="ct-field-value mono">{patient.mrn}</span>
        </div>
      </div>
    </div>
  );
}
