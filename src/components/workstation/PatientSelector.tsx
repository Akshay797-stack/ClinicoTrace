'use client';

// ============================================================
// ClinicoTrace — PatientSelector
// Extracted from doctor/page.tsx (Stage 1 refactor).
// No behavior change. Identical rendering.
// Stage 3: Will be replaced by a real OPD Queue view.
// ============================================================

import type { Patient } from '@/types/clinical';
import { DEMO_PATIENTS } from '@/data/demoPatients';

interface PatientSelectorProps {
  onSelect: (p: Patient) => void;
}

export function PatientSelector({ onSelect }: PatientSelectorProps) {
  return (
    <div style={{ padding: '20px', maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <h1 className="ct-text-head-lg" style={{ marginBottom: '4px' }}>Good morning, Dr. Priya.</h1>
        <p className="ct-text-body ct-muted">OPD — Morning Session · 42 patients waiting · Select a patient to begin.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {DEMO_PATIENTS.map((p) => (
          <button
            key={p.id}
            id={`ct-patient-${p.id}`}
            onClick={() => onSelect(p)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', background: 'var(--ct-surface)',
              border: '1px solid var(--ct-border)', borderRadius: 'var(--ct-radius-md)',
              cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ct-blue)'; e.currentTarget.style.background = 'var(--ct-blue-light)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ct-border)'; e.currentTarget.style.background = 'var(--ct-surface)'; }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'var(--ct-blue-light)', border: '1.5px solid var(--ct-blue-mid)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 700, color: 'var(--ct-blue)', flexShrink: 0,
              }}>
                {p.name.charAt(0)}
              </div>
              <div>
                <div className="ct-text-head-sm" style={{ color: 'var(--ct-text-primary)', marginBottom: '3px' }}>
                  {p.name}
                  <span className="ct-text-body-sm ct-muted" style={{ marginLeft: '8px' }}>
                    {p.age} yr · {p.sex} · {p.id}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {p.conditions.map((c) => <span key={c} className="ct-badge ct-badge-amber">{c}</span>)}
                  {p.conditions.length === 0 && <span className="ct-badge ct-badge-green">No active conditions</span>}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
              {p.currentMedications.length > 0 && (
                <span className="ct-badge ct-badge-gray">{p.currentMedications.length} current med{p.currentMedications.length > 1 ? 's' : ''}</span>
              )}
              <span className="ct-text-label" style={{ color: 'var(--ct-blue)' }}>Select →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
