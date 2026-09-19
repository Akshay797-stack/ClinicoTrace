'use client';

// ============================================================
// ClinicoTrace — AccessPolicyPanel
// Extracted from doctor/page.tsx (Stage 1 refactor).
// No behavior change. Identical rendering.
// ============================================================

import { useState } from 'react';
import type { Principal, UserRole } from '@/types/clinical';
import { providerRegistry } from '@/providers/registry';

interface AccessPolicyPanelProps {
  user: { name: string; role: UserRole };
}

export function AccessPolicyPanel({ user }: AccessPolicyPanelProps) {
  const [show, setShow] = useState(false);
  const principal: Principal = {
    id: 'p-001',
    name: user.name,
    role: user.role,
    department: 'General Medicine',
    hospitalUnit: 'OPD',
  };

  const permissions = providerRegistry.authz.listPermissions(principal);
  const allowed = permissions.filter((p) => p.effect === 'ALLOW');
  const denied = permissions.filter((p) => p.effect === 'DENY');

  // Demo: check prescribe on patient:clinical
  const prescribeDecision = providerRegistry.authz.decide(principal, 'prescribe', 'patient:clinical');

  return (
    <div className="ct-panel">
      <div className="ct-panel-header" style={{ cursor: 'pointer' }} onClick={() => setShow(!show)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: 'var(--ct-blue)' }}>
            <path d="M7 1L2 3v4c0 3.2 2.2 5.6 5 6.5 2.8-.9 5-3.3 5-6.5V3L7 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
          <span className="ct-text-head-sm">Access Policy</span>
          <span className="ct-badge ct-badge-demo">Demo Cedar</span>
        </div>
        <span className="ct-text-label ct-muted">{show ? '▲' : '▼'} {show ? 'Hide' : 'Show'}</span>
      </div>

      {show && (
        <div className="ct-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Principal */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div className="ct-field">
              <span className="ct-field-label">Current User</span>
              <span className="ct-field-value">{user.name}</span>
            </div>
            <div className="ct-field">
              <span className="ct-field-label">Role</span>
              <span className="ct-field-value" style={{ textTransform: 'capitalize' }}>{user.role}</span>
            </div>
          </div>

          {/* Demo decision */}
          <div style={{
            padding: '10px 12px', background: prescribeDecision.decision === 'ALLOW' ? 'var(--ct-green-light)' : 'var(--ct-red-light)',
            border: `1px solid ${prescribeDecision.decision === 'ALLOW' ? 'var(--ct-green-border)' : 'var(--ct-red-border)'}`,
            borderRadius: 'var(--ct-radius)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="ct-text-head-sm" style={{ color: prescribeDecision.decision === 'ALLOW' ? 'var(--ct-green)' : 'var(--ct-red)' }}>
                {prescribeDecision.decision}: prescribe on patient:clinical
              </span>
            </div>
            <div className="ct-text-body-sm ct-muted">
              Policy: <span style={{ fontFamily: 'var(--ct-font-mono)', fontSize: '11px' }}>{prescribeDecision.policyId}</span>
            </div>
            <div className="ct-text-body-sm ct-muted">{prescribeDecision.reason}</div>
          </div>

          {/* Permissions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div className="ct-field-label" style={{ marginBottom: '6px', color: 'var(--ct-green)' }}>✓ Access Granted</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {allowed.map((p) => (
                  <div key={p.resource} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--ct-green)', flexShrink: 0, marginTop: '2px' }}>
                      <path d="M2.5 6l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="ct-text-body-sm" style={{ color: 'var(--ct-text-secondary)' }}>{p.resource}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="ct-field-label" style={{ marginBottom: '6px', color: 'var(--ct-red)' }}>✕ Access Restricted</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {denied.map((p) => (
                  <div key={p.resource} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--ct-red)', flexShrink: 0, marginTop: '2px' }}>
                      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                    <span className="ct-text-body-sm" style={{ color: 'var(--ct-text-secondary)' }}>{p.resource}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ padding: '8px 10px', background: 'var(--ct-bg)', border: '1px solid var(--ct-border-subtle)', borderRadius: 'var(--ct-radius)' }}>
            <p className="ct-text-body-sm ct-muted">
              Policy engine: <span style={{ fontFamily: 'var(--ct-font-mono)', fontSize: '11px' }}>
                {prescribeDecision.providerName}
              </span>
              {' '}· isLive: <span style={{ fontFamily: 'var(--ct-font-mono)', fontSize: '11px', color: prescribeDecision.isLive ? 'var(--ct-green)' : 'var(--ct-amber)' }}>
                {String(prescribeDecision.isLive)}
              </span>
              {' '}· Not connected to AWS Verified Permissions in demo mode.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
