'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DoctorShell } from '@/components/shell/DoctorShell';
import { CLINICAL_RULES } from '@/data/clinicalRules';
import type { UserRole } from '@/types/clinical';

export default function SafetyPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: UserRole; unit: string } | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const stored = sessionStorage.getItem('ct_user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'doctor') { router.push(`/${u.role}`); return; }
    setUser(u);
  }, [router]);

  if (!user) return <div style={{ padding: '40px', color: 'var(--ct-text-muted)' }}>Loading…</div>;

  const ruleTypes = ['all', ...Array.from(new Set(CLINICAL_RULES.map(r => r.ruleType)))];
  const filtered = CLINICAL_RULES.filter(r => {
    const matchesSearch = search === '' ||
      r.matchTerms.some(m => m.toLowerCase().includes(search.toLowerCase())) ||
      r.ruleId.toLowerCase().includes(search.toLowerCase()) ||
      r.explanation.toLowerCase().includes(search.toLowerCase());
    const matchesType = filter === 'all' || r.ruleType === filter;
    return matchesSearch && matchesType;
  });

  const SEVERITY_COLOR: Record<string, { bg: string; text: string }> = {
    Critical: { bg: 'var(--ct-red-light)',   text: 'var(--ct-red)' },
    Moderate: { bg: 'var(--ct-amber-light)',  text: 'var(--ct-amber)' },
    High:     { bg: 'var(--ct-amber-light)',  text: 'var(--ct-amber)' },
    Low:      { bg: 'var(--ct-green-light)',  text: 'var(--ct-green)' },
  };

  return (
    <DoctorShell active="safety" user={user}>
      <div style={{ padding: '16px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h1 className="ct-text-head-lg" style={{ marginBottom: '2px' }}>Clinical Safety Rules</h1>
            <p className="ct-text-body ct-muted">Source: British National Formulary (BNF) 86 · NFI 2021 (formulary reference only)</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="ct-badge ct-badge-demo">Deterministic engine · {CLINICAL_RULES.length} rules loaded</span>
            <span className="ct-badge ct-badge-blue">isLive: false</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
          {[
            { label: 'Total Rules', value: CLINICAL_RULES.length, color: 'var(--ct-blue)' },
            { label: 'DDI Rules', value: CLINICAL_RULES.filter(r => r.ruleType === 'DDI').length, color: 'var(--ct-amber)' },
            { label: 'Drug-Condition', value: CLINICAL_RULES.filter(r => r.ruleType === 'DCI').length, color: 'var(--ct-cyan)' },
            { label: 'Duplicate Therapy', value: CLINICAL_RULES.filter(r => r.ruleType === 'DuplicateTherapy').length, color: 'var(--ct-text-muted)' },
          ].map(s => (
            <div key={s.label} style={{ padding: '12px 16px', background: 'var(--ct-surface)', border: '1px solid var(--ct-border)', borderRadius: 'var(--ct-radius-md)' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: '4px' }}>{s.value}</div>
              <div className="ct-text-label ct-muted">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <input
            className="ct-input"
            style={{ flex: 1, maxWidth: '360px' }}
            placeholder="Search by medication, rule ID, or keyword…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            {ruleTypes.map(t => (
              <button
                key={t}
                className={`ct-btn ct-btn-sm ${filter === t ? 'ct-btn-secondary' : 'ct-btn-ghost'}`}
                onClick={() => setFilter(t)}
                style={{ textTransform: 'capitalize' }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Rules list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(rule => {
            const sev = SEVERITY_COLOR[rule.severity] ?? { bg: 'var(--ct-bg)', text: 'var(--ct-text-muted)' };
            return (
              <div key={rule.ruleId} style={{ background: 'var(--ct-surface)', border: '1px solid var(--ct-border)', borderRadius: 'var(--ct-radius-md)', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--ct-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ct-surface-raised)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'var(--ct-font-mono)', fontSize: '11px', color: 'var(--ct-text-muted)' }}>{rule.ruleId}</span>
                    <span className="ct-badge ct-badge-gray">{rule.ruleType}</span>
                    <span style={{ padding: '2px 8px', background: sev.bg, borderRadius: 'var(--ct-radius-sm)', fontSize: '11px', fontWeight: 600, color: sev.text }}>
                      {rule.severity}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="ct-text-label ct-muted" style={{ fontSize: '10px' }}>{rule.source}</span>
                    <span className="ct-text-label ct-muted" style={{ fontSize: '10px' }}>· {rule.sourceVersion}</span>
                  </div>
                </div>
                <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div className="ct-field-label" style={{ marginBottom: '4px' }}>Medications / Drug Classes</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {rule.perpetratorDrug && <span className="ct-badge ct-badge-blue">{rule.perpetratorDrug}</span>}
                      {rule.objectDrug && <span className="ct-badge ct-badge-amber">{rule.objectDrug}</span>}
                    </div>
                    {rule.condition && (
                      <div style={{ marginTop: '8px' }}>
                        <div className="ct-field-label" style={{ marginBottom: '4px' }}>Condition</div>
                        <span className="ct-badge ct-badge-amber">{rule.condition}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="ct-field-label" style={{ marginBottom: '4px' }}>Explanation</div>
                    <p className="ct-text-body-sm" style={{ color: 'var(--ct-text-secondary)', lineHeight: 1.7, marginBottom: '8px' }}>{rule.explanation}</p>
                    <div className="ct-field-label" style={{ marginBottom: '4px', color: 'var(--ct-amber)' }}>Required Clinical Action</div>
                    <p className="ct-text-body-sm" style={{ color: 'var(--ct-text-secondary)', lineHeight: 1.6 }}>{rule.requiredClinicalAction}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="ct-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <p className="ct-text-body ct-muted">No rules match your search.</p>
            </div>
          )}
        </div>
      </div>
    </DoctorShell>
  );
}
