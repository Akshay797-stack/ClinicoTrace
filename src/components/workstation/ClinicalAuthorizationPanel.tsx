'use client';

// ============================================================
// ClinicoTrace — ClinicalAuthorizationPanel
// Extracted from doctor/page.tsx (Stage 1 refactor).
// No behavior change. Identical rendering.
// ============================================================

import type { Patient, Medication, SafetyFinding } from '@/types/clinical';

interface ClinicalAuthorizationPanelProps {
  patient: Patient;
  medications: Medication[];
  findings: SafetyFinding[];
  acknowledged: Set<string>;
  onAuthorize: () => void;
  authorized: boolean;
}

export function ClinicalAuthorizationPanel({
  patient, medications, findings, acknowledged, onAuthorize, authorized,
}: ClinicalAuthorizationPanelProps) {
  const pendingFindings = findings.filter((f) => !acknowledged.has(f.findingId));
  const canAuthorize = pendingFindings.length === 0;

  return (
    <div className="ct-auth-box">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div className="ct-text-micro ct-muted" style={{ marginBottom: '2px' }}>Step 4 of 4</div>
          <h2 className="ct-text-head" style={{ color: 'var(--ct-text-primary)' }}>Final Clinical Review</h2>
        </div>
        {authorized && <span className="ct-badge ct-badge-green" style={{ fontSize: '12px', padding: '4px 10px' }}>✓ Authorized</span>}
      </div>

      {/* Summary */}
      <div style={{ background: 'var(--ct-bg)', border: '1px solid var(--ct-border-subtle)', borderRadius: 'var(--ct-radius)', marginBottom: '14px', overflow: 'hidden' }}>
        <table className="ct-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Medication</th>
              <th>Strength</th>
              <th>Frequency</th>
              <th>Route</th>
              <th>Safety</th>
            </tr>
          </thead>
          <tbody>
            {medications.map((med) => (
              <tr key={med.id}>
                <td style={{ color: 'var(--ct-text-primary)' }}>{patient.name}</td>
                <td style={{ fontWeight: 500, color: 'var(--ct-text-primary)' }}>{med.name}</td>
                <td>{med.strength}</td>
                <td>{med.frequency}</td>
                <td>{med.route}</td>
                <td>
                  {findings.length === 0
                    ? <span className="ct-badge ct-badge-green">Clear</span>
                    : <span className="ct-badge ct-badge-amber">Reviewed</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!canAuthorize && (
        <div className="ct-alert ct-alert-amber" style={{ marginBottom: '12px', fontSize: '12px' }}>
          <strong>{pendingFindings.length} safety finding(s) require clinician review before authorization.</strong>
          {' '}Expand each finding and click &ldquo;Mark as Reviewed&rdquo; to proceed.
        </div>
      )}

      {!authorized ? (
        <div>
          <button
            id="ct-authorize-btn"
            className="ct-btn ct-btn-authorize"
            onClick={onAuthorize}
            disabled={!canAuthorize}
            style={{ opacity: canAuthorize ? 1 : 0.5, cursor: canAuthorize ? 'pointer' : 'not-allowed' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L2 3v4c0 3.2 2.2 5.6 5 6.5 2.8-.9 5-3.3 5-6.5V3L7 1z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M4.5 7l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Authorize Prescription
          </button>
          <p className="ct-text-body-sm ct-muted" style={{ marginTop: '8px' }}>
            Authorization confirms that the prescribing clinician has reviewed the extracted and safety-checked information.
            This action is recorded in the audit trail.
          </p>
        </div>
      ) : (
        <div className="ct-alert ct-alert-green">
          <p className="ct-text-ui" style={{ color: 'var(--ct-green)', marginBottom: '2px' }}>Prescription authorized</p>
          <p className="ct-text-body-sm" style={{ color: 'var(--ct-green)' }}>
            {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} · Dr. Priya Sharma
          </p>
        </div>
      )}
    </div>
  );
}
