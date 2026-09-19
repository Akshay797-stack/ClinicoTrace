'use client';

// ============================================================
// ClinicoTrace — NavRail Shell Component
// Extracted from doctor/page.tsx (Stage 1 refactor).
// No behavior change. Identical rendering.
// ============================================================

export function NavRail({ active }: { active: string }) {
  const items = [
    { id: 'patients', label: 'Patients', icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )},
    { id: 'queue', label: 'Queue', icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="3" y="3" width="12" height="2" rx="1" fill="currentColor"/>
        <rect x="3" y="8" width="12" height="2" rx="1" fill="currentColor"/>
        <rect x="3" y="13" width="8" height="2" rx="1" fill="currentColor"/>
      </svg>
    )},
    { id: 'rx', label: 'Rx', icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="4" y="2" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 6h4M7 9h4M7 12h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    )},
    { id: 'safety', label: 'Safety', icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L3 4.5v5c0 4 2.5 6.5 6 7.5 3.5-1 6-3.5 6-7.5v-5L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M6.5 9l2 2 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )},
    { id: 'history', label: 'History', icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )},
  ];

  return (
    <nav className="ct-nav-rail">
      {/* Logo mark only — wordmark is in the header */}
      <div style={{
        width: '36px', height: '36px',
        background: 'var(--ct-blue)',
        borderRadius: '7px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '10px',
        flexShrink: 0,
      }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M9 3h2v5h5v2h-5v5H9v-5H4v-2h5z" fill="white"/>
          <circle cx="10" cy="10" r="8.5" stroke="white" strokeWidth="1.2" fill="none" opacity="0.4"/>
        </svg>
      </div>

      <div style={{ height: '1px', background: 'var(--ct-border-subtle)', width: '36px', margin: '0 auto 8px' }} />

      {items.map((item) => (
        <button
          key={item.id}
          className={`ct-nav-item${item.id === active ? ' active' : ''}`}
          title={item.label}
          aria-label={item.label}
        >
          {item.icon}
          <span className="ct-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
