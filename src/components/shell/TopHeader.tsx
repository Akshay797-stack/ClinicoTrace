'use client';

// ============================================================
// ClinicoTrace — TopHeader Shell Component
// Extracted from doctor/page.tsx (Stage 1 refactor).
// No behavior change. Identical rendering.
// ============================================================

import type { Patient } from '@/types/clinical';

interface TopHeaderProps {
  user: { name: string; role: string; unit: string };
  patient: Patient | null;
}

export function TopHeader({ user, patient }: TopHeaderProps) {
  return (
    <header className="ct-header" style={{ paddingLeft: '16px', gap: '16px' }}>
      {/* Logo wordmark — always visible in header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, paddingRight: '16px', borderRight: '1px solid var(--ct-border)' }}>
        <span style={{
          fontFamily: 'var(--ct-font-sans)',
          fontSize: '16px',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--ct-text-primary)',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}>
          Clinico<span style={{ color: 'var(--ct-blue)' }}>Trace</span>
          <sup style={{ fontSize: '9px', color: 'var(--ct-text-muted)', fontWeight: 500, letterSpacing: 0 }}>™</sup>
        </span>
      </div>

      {/* Session + patient context */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span className="ct-text-label" style={{ color: 'var(--ct-text-muted)' }}>OPD · Morning Session</span>
          <span className="ct-badge ct-badge-blue" style={{ fontSize: '10px' }}>42 waiting</span>
        </div>

        {patient && (
          <>
            <div style={{ width: '1px', height: '20px', background: 'var(--ct-border)', flexShrink: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ct-cyan)', flexShrink: 0,
              }} />
              <span className="ct-text-ui" style={{ color: 'var(--ct-text-primary)', flexShrink: 0 }}>{patient.name}</span>
              <span className="ct-text-body-sm ct-muted ct-truncate">{patient.age}yr · {patient.sex} · {patient.id}</span>
              {patient.conditions.map((c) => (
                <span key={c} className="ct-badge ct-badge-gray" style={{ flexShrink: 0 }}>{c}</span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right: user info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <div className="ct-text-ui" style={{ color: 'var(--ct-text-primary)', lineHeight: 1.2 }}>{user.name}</div>
          <div className="ct-text-label ct-muted" style={{ lineHeight: 1.2 }}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)} · {user.unit}
          </div>
        </div>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'var(--ct-blue-light)', border: '1.5px solid var(--ct-blue-mid)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 600, color: 'var(--ct-blue)', flexShrink: 0,
        }}>
          {user.name.charAt(0)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <div className="ct-status-dot green" />
          <span style={{ fontSize: '10px', color: 'var(--ct-green)', fontWeight: 600 }}>Secure</span>
        </div>
      </div>
    </header>
  );
}
