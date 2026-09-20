'use client';

// ============================================================
// ClinicoTrace — Doctor Shell Layout
// Wraps every doctor sub-page with NavRail + TopHeader.
// ============================================================

import type { ReactNode } from 'react';
import { NavRail } from '@/components/shell/NavRail';
import { TopHeader } from '@/components/shell/TopHeader';
import type { Patient } from '@/types/clinical';

interface DoctorShellProps {
  active: string;
  user: { name: string; role: string; unit: string };
  patient?: Patient | null;
  children: ReactNode;
}

export function DoctorShell({ active, user, patient = null, children }: DoctorShellProps) {
  return (
    <div className="ct-shell">
      <NavRail active={active} />
      <TopHeader user={user} patient={patient} />
      <main className="ct-main">
        {/* Demo banner */}
        <div className="ct-demo-banner">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 4v4M6 3v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Demo Mode · Deterministic mock data · Not for clinical use · Safety rules: BNF 86
        </div>
        {children}
      </main>
    </div>
  );
}
