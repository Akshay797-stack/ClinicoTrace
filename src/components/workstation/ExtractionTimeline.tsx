'use client';

// ============================================================
// ClinicoTrace — ExtractionTimeline
// Extracted from doctor/page.tsx (Stage 1 refactor).
// No behavior change. Identical rendering.
// ============================================================

import type { ExtractionStep } from '@/types/clinical';

const EXTRACTION_STEPS: { key: ExtractionStep; label: string }[] = [
  { key: 'input_received',         label: 'Input received' },
  { key: 'medications_identified', label: 'Medications identified' },
  { key: 'dosage_normalized',      label: 'Dosage & frequency normalized' },
  { key: 'entities_structured',    label: 'Clinical entities structured' },
  { key: 'safety_validation',      label: 'Dispatching to safety engine…' },
];

export function ExtractionTimeline({ currentStep }: { currentStep: ExtractionStep }) {
  const stepOrder: ExtractionStep[] = [
    'input_received', 'medications_identified', 'dosage_normalized',
    'entities_structured', 'safety_validation',
  ];
  const currentIdx = stepOrder.indexOf(currentStep);

  return (
    <div className="ct-panel" style={{ marginBottom: '12px' }}>
      <div className="ct-panel-header">
        <span className="ct-text-head-sm">AI Extraction</span>
        <span className="ct-badge ct-badge-demo">Demo — Not live AI</span>
      </div>
      <div className="ct-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ padding: '8px 10px', background: 'var(--ct-blue-light)', border: '1px solid var(--ct-blue-mid)', borderRadius: 'var(--ct-radius)', marginBottom: '4px' }}>
          <p className="ct-text-body-sm" style={{ color: 'var(--ct-blue)' }}>
            <strong>AI extracted — clinician verification required.</strong> Review all fields before authorizing.
          </p>
        </div>
        {EXTRACTION_STEPS.map((step, idx) => {
          const done = currentIdx > idx;
          const active = currentIdx === idx;
          const pending = currentIdx < idx;

          return (
            <div key={step.key} className="ct-timeline-item" style={{ paddingBottom: '8px' }}>
              <div className={`ct-timeline-node ${done ? 'done' : active ? 'active' : 'pending'}`}>
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span style={{ fontSize: '10px', fontWeight: 700 }}>{idx + 1}</span>
                )}
              </div>
              <div style={{ paddingTop: '5px' }}>
                <span className={`ct-text-ui ${pending ? 'ct-muted' : ''}`}
                  style={{ color: done ? 'var(--ct-green)' : active ? 'var(--ct-blue)' : undefined }}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
