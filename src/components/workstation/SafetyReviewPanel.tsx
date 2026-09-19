'use client';

// ============================================================
// ClinicoTrace — SafetyReviewPanel + SafetyFindingCard
// Extracted from doctor/page.tsx (Stage 1 refactor).
// No behavior change. Identical rendering.
// ============================================================

import { useState } from 'react';
import type { SafetyEvalResult, SafetyFinding } from '@/types/clinical';

// ---- SafetyFindingCard -------------------------------------

interface SafetyFindingCardProps {
  finding: SafetyFinding;
  expanded: boolean;
  onToggle: () => void;
  acknowledged: boolean;
  onAcknowledge: () => void;
}

function SafetyFindingCard({ finding, expanded, onToggle, acknowledged, onAcknowledge }: SafetyFindingCardProps) {
  const isCritical = finding.severity === 'Critical';

  return (
    <div className={`ct-finding-card${isCritical ? ' critical' : ''}`}>
      <div className="ct-finding-header" style={{ cursor: 'pointer' }} onClick={onToggle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>{isCritical ? '⛔' : '⚠️'}</span>
          <div>
            <div className="ct-text-head-sm" style={{ color: isCritical ? 'var(--ct-red)' : 'var(--ct-amber)' }}>
              {finding.ruleType} — {finding.severity}
            </div>
            <div className="ct-text-body-sm" style={{ color: 'var(--ct-text-secondary)', marginTop: '2px' }}>
              {finding.perpetuatingMedication && finding.objectMedication
                ? `${finding.perpetuatingMedication} (current) + ${finding.objectMedication} (new)`
                : finding.medications.join(' + ')}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {acknowledged && <span className="ct-badge ct-badge-green">Reviewed</span>}
          <span className="ct-text-label ct-muted">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="ct-finding-body">
          {/* Explainability trace */}
          <div className="ct-finding-explainability">
            <div style={{
              padding: '8px 12px', borderBottom: '1px solid var(--ct-border)',
              background: 'var(--ct-surface-raised)',
            }}>
              <span className="ct-text-micro" style={{ color: 'var(--ct-text-muted)' }}>
                Rule Explainability Trace
              </span>
            </div>

            {[
              { label: 'Rule ID', value: finding.ruleId, mono: true },
              { label: 'Rule Type', value: finding.ruleType },
              { label: 'Medications', value: finding.medications.join(' + ') },
              { label: 'Source', value: finding.source },
              { label: 'Source Version', value: finding.sourceVersion },
            ].map((row) => (
              <div key={row.label} style={{
                display: 'grid', gridTemplateColumns: '130px 1fr',
                borderBottom: '1px solid var(--ct-border-subtle)',
                padding: '7px 12px',
              }}>
                <span className="ct-field-label">{row.label}</span>
                <span className={`ct-field-value ${row.mono ? 'mono' : ''}`}>{row.value}</span>
              </div>
            ))}

            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--ct-border-subtle)' }}>
              <div className="ct-field-label" style={{ marginBottom: '4px' }}>Explanation</div>
              <p className="ct-text-body-sm" style={{ color: 'var(--ct-text-secondary)', lineHeight: 1.7 }}>
                {finding.explanation}
              </p>
            </div>

            <div style={{ padding: '10px 12px', background: 'var(--ct-amber-light)' }}>
              <div className="ct-field-label" style={{ marginBottom: '4px', color: 'var(--ct-amber)' }}>
                Required Clinical Action
              </div>
              <p className="ct-text-body-sm" style={{ color: 'var(--ct-text-secondary)', lineHeight: 1.7 }}>
                {finding.requiredClinicalAction}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              id={`ct-ack-${finding.findingId}`}
              className="ct-btn ct-btn-secondary ct-btn-sm"
              onClick={onAcknowledge}
              disabled={acknowledged}
            >
              {acknowledged ? '✓ Reviewed' : 'Mark as Reviewed'}
            </button>
            <button className="ct-btn ct-btn-ghost ct-btn-sm">
              Modify Prescription
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- SafetyReviewPanel -------------------------------------

interface SafetyReviewPanelProps {
  result: SafetyEvalResult;
  onAcknowledge: (findingId: string) => void;
  acknowledged: Set<string>;
}

export function SafetyReviewPanel({ result, onAcknowledge, acknowledged }: SafetyReviewPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="ct-panel">
      <div className="ct-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="ct-text-head-sm">Safety Review</span>
          <span className="ct-badge ct-badge-demo">Deterministic · Demo Rules</span>
        </div>
        <span className={`ct-badge ${
          result.status === 'clear' ? 'ct-badge-green' :
          result.status === 'warning' ? 'ct-badge-amber' : 'ct-badge-red'
        }`}>
          {result.status === 'clear' ? '✓ Clear' : result.status === 'warning' ? '⚠ Warning' : '✕ Critical'}
        </span>
      </div>
      <div className="ct-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Checks performed */}
        <div>
          <div className="ct-field-label" style={{ marginBottom: '6px' }}>Checks performed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {result.checksPerformed.map((check) => (
              <div key={check} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--ct-green)', flexShrink: 0 }}>
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M3.5 6l1.8 1.8 3.2-3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="ct-text-body-sm" style={{ color: 'var(--ct-text-secondary)' }}>{check}</span>
              </div>
            ))}
          </div>
        </div>

        {result.findings.length === 0 ? (
          <div className="ct-alert ct-alert-green">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--ct-green)', flexShrink: 0 }}>
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5 8l2.2 2.2 3.8-3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <p className="ct-text-ui" style={{ color: 'var(--ct-green)', marginBottom: '2px' }}>No safety findings</p>
                <p className="ct-text-body-sm" style={{ color: 'var(--ct-green)' }}>Prescription cleared all rule checks.</p>
              </div>
            </div>
          </div>
        ) : (
          result.findings.map((finding) => (
            <SafetyFindingCard
              key={finding.findingId}
              finding={finding}
              expanded={expanded === finding.findingId}
              onToggle={() => setExpanded(expanded === finding.findingId ? null : finding.findingId)}
              acknowledged={acknowledged.has(finding.findingId)}
              onAcknowledge={() => onAcknowledge(finding.findingId)}
            />
          ))
        )}

        {/* Disclaimer */}
        <div style={{
          padding: '10px 12px', background: 'var(--ct-bg)',
          border: '1px solid var(--ct-border-subtle)', borderRadius: 'var(--ct-radius)',
        }}>
          <p className="ct-text-body-sm" style={{ color: 'var(--ct-text-muted)', fontStyle: 'italic' }}>
            ClinicoTrace provides safety signals based on deterministic rule evaluation.
            Final clinical decisions remain with the authorized prescribing clinician.
          </p>
        </div>

        {/* Rule source */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="ct-text-label ct-muted">Rules source:</span>
          <span className="ct-text-label" style={{ color: 'var(--ct-text-secondary)' }}>
            British National Formulary (BNF) 86 · NFI 2021 (formulary ref only)
          </span>
        </div>
      </div>
    </div>
  );
}
