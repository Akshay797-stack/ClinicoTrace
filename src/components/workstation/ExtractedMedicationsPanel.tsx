'use client';

// ============================================================
// ClinicoTrace — ExtractedMedicationsPanel
// Extracted from doctor/page.tsx (Stage 1 refactor).
// No behavior change. Identical rendering + stagger animation.
// ============================================================

import type { Medication } from '@/types/clinical';

interface ExtractedMedicationsPanelProps {
  medications: Medication[];
  visible: boolean;
}

export function ExtractedMedicationsPanel({ medications, visible }: ExtractedMedicationsPanelProps) {
  if (!visible || medications.length === 0) return null;

  return (
    <div className="ct-panel">
      <div className="ct-panel-header">
        <span className="ct-text-head-sm">Extracted Prescription</span>
        <span className="ct-badge ct-badge-amber">Requires clinician review</span>
      </div>
      <div className="ct-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {medications.map((med, i) => (
          <div key={med.id} className="ct-med-card ct-field-appear" style={{ animationDelay: `${i * 180}ms` }}>
            <div className="ct-med-card-header">
              <div>
                <span className="ct-text-head-sm" style={{ color: 'var(--ct-text-primary)' }}>{med.name}</span>
                <span className="ct-text-body-sm ct-muted" style={{ marginLeft: '8px' }}>
                  ({med.genericName})
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span className="ct-text-label ct-muted">
                  Confidence: {Math.round(med.extractionConfidence * 100)}%
                </span>
                <span className={`ct-badge ${med.extractionConfidence >= 0.9 ? 'ct-badge-green' : 'ct-badge-amber'}`}>
                  {med.extractionConfidence >= 0.9 ? 'High' : 'Verify'}
                </span>
              </div>
            </div>
            <div className="ct-med-grid">
              {[
                { label: 'Strength', value: med.strength },
                { label: 'Frequency', value: med.frequency },
                { label: 'Route', value: med.route },
                { label: 'Timing', value: med.timing ?? '—' },
                { label: 'Duration', value: med.duration ?? '—' },
                { label: 'Instructions', value: med.instructions ?? '—' },
              ].map((field) => (
                <div key={field.label} className="ct-med-grid-item">
                  <div className="ct-field">
                    <span className="ct-field-label">{field.label}</span>
                    <span className="ct-field-value">{field.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
