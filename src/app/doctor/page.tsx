'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_PATIENTS, DEMO_VOICE_TRANSCRIPT, DEMO_EXTRACTED_MEDICATIONS } from '@/data/demoPatients';
import { DemoSafetyProvider } from '@/providers/demo/DemoSafetyProvider';
import { DemoAuthzProvider } from '@/providers/demo/DemoAuthzProvider';
import { getArunKumarInstructions, LANGUAGE_LABELS, SECTION_LABELS } from '@/data/translations';
import type {
  Patient, Medication, SafetyEvalResult, SafetyFinding, WorkflowStep,
  SupportedLanguage, ExtractionStep, Principal, UserRole
} from '@/types/clinical';

// ---- Helpers -----------------------------------------------
const safetyProvider = new DemoSafetyProvider();
const authzProvider = new DemoAuthzProvider();

const EXTRACTION_STEPS: { key: ExtractionStep; label: string; duration: number }[] = [
  { key: 'input_received',          label: 'Input received',                  duration: 800  },
  { key: 'medications_identified',  label: 'Medications identified',           duration: 1400 },
  { key: 'dosage_normalized',       label: 'Dosage & frequency normalized',    duration: 1200 },
  { key: 'entities_structured',     label: 'Clinical entities structured',     duration: 1000 },
  { key: 'safety_validation',       label: 'Dispatching to safety engine…',   duration: 800  },
];

// ---- Sub-components ----------------------------------------

function CtLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '28px', height: '28px', background: 'var(--ct-blue)',
        borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M7 3h2v3h3v2h-3v3H7v-3H4V6h3z" fill="white"/>
          <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.2" fill="none" opacity="0.4"/>
        </svg>
      </div>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--ct-text-primary)' }}>
          Clinico<span style={{ color: 'var(--ct-blue)' }}>Trace</span>
        </div>
        <div style={{ fontSize: '9px', fontWeight: 600, color: 'var(--ct-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Clinical Safety System
        </div>
      </div>
    </div>
  );
}

function NavRail({ active }: { active: string }) {
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

function TopHeader({ user, patient }: { user: { name: string; role: string; unit: string }; patient: Patient | null }) {
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

// ---- Patient Context Panel ---------------------------------
function PatientContextPanel({ patient }: { patient: Patient }) {
  return (
    <div className="ct-panel" style={{ height: '100%' }}>
      <div className="ct-panel-header">
        <span className="ct-text-head-sm">Patient</span>
        <span className="ct-badge ct-badge-blue">{patient.id}</span>
      </div>
      <div className="ct-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Demographics */}
        <div>
          <div className="ct-field-label" style={{ marginBottom: '6px' }}>Demographics</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
            <div className="ct-field">
              <span className="ct-field-label">Name</span>
              <span className="ct-field-value">{patient.name}</span>
            </div>
            <div className="ct-field">
              <span className="ct-field-label">Age / Sex</span>
              <span className="ct-field-value">{patient.age} yr · {patient.sex}</span>
            </div>
            <div className="ct-field">
              <span className="ct-field-label">Blood Group</span>
              <span className="ct-field-value">{patient.bloodGroup ?? '—'}</span>
            </div>
            <div className="ct-field">
              <span className="ct-field-label">Weight</span>
              <span className="ct-field-value">{patient.weight ? `${patient.weight} kg` : '—'}</span>
            </div>
          </div>
        </div>

        <div className="ct-divider" />

        {/* Conditions */}
        <div>
          <div className="ct-field-label" style={{ marginBottom: '6px' }}>Active Conditions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {patient.conditions.map((c) => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="ct-status-dot amber" />
                <span className="ct-text-body" style={{ color: 'var(--ct-text-secondary)' }}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ct-divider" />

        {/* Allergies */}
        <div>
          <div className="ct-field-label" style={{ marginBottom: '6px' }}>Drug Allergies</div>
          {patient.allergies.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ color: 'var(--ct-green)', flexShrink: 0 }}>
                <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M4 6.5l1.8 1.8 3.2-3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="ct-text-body-sm" style={{ color: 'var(--ct-green)' }}>No known drug allergies</span>
            </div>
          ) : (
            patient.allergies.map((a) => (
              <span key={a} className="ct-badge ct-badge-red" style={{ marginRight: '4px' }}>{a}</span>
            ))
          )}
        </div>

        <div className="ct-divider" />

        {/* Current Medications */}
        <div>
          <div className="ct-field-label" style={{ marginBottom: '6px' }}>Current Medications</div>
          {patient.currentMedications.length === 0 ? (
            <span className="ct-text-body-sm ct-muted">None on record</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {patient.currentMedications.map((med, i) => (
                <div key={i} style={{
                  padding: '8px 10px', background: 'var(--ct-bg)',
                  border: '1px solid var(--ct-border-subtle)', borderRadius: 'var(--ct-radius)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span className="ct-text-body" style={{ fontWeight: 600, color: 'var(--ct-text-primary)' }}>
                      {med.name} {med.strength}
                    </span>
                    <span className="ct-badge ct-badge-gray">{med.frequency}</span>
                  </div>
                  <span className="ct-text-body-sm ct-muted">{med.prescribedFor} · {med.route}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ct-divider" />

        {/* MRN */}
        <div className="ct-field">
          <span className="ct-field-label">MRN</span>
          <span className="ct-field-value mono">{patient.mrn}</span>
        </div>
      </div>
    </div>
  );
}

// ---- Voice Input -------------------------------------------
function VoiceInputPanel({
  onTranscript,
  transcript,
  setTranscript,
}: {
  onTranscript: (t: string) => void;
  transcript: string;
  setTranscript: (t: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [demoPhase, setDemoPhase] = useState<'idle' | 'recording' | 'done'>('idle');

  const handleRecord = () => {
    if (recording) return;
    setRecording(true);
    setDemoPhase('recording');
    setElapsed(0);
    setTranscript('');

    // Simulate progressive transcript appearance
    const words = DEMO_VOICE_TRANSCRIPT.split(' ');
    let wordIndex = 0;
    const wordInterval = setInterval(() => {
      wordIndex++;
      setTranscript(words.slice(0, wordIndex).join(' '));
      if (wordIndex >= words.length) {
        clearInterval(wordInterval);
        setRecording(false);
        setDemoPhase('done');
      }
    }, 80);

    const elapsedInterval = setInterval(() => {
      setElapsed((p) => {
        if (p >= words.length * 0.08 + 1) { clearInterval(elapsedInterval); return p; }
        return p + 0.1;
      });
    }, 100);
  };

  const formatTime = (s: number) => {
    const sec = Math.floor(s);
    return `00:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="ct-panel" style={{ marginBottom: '12px' }}>
      <div className="ct-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="ct-text-head-sm">Clinical Voice Input</span>
          <span className="ct-badge ct-badge-demo">Demo Mode</span>
        </div>
        {recording && (
          <div className="ct-status">
            <div className="ct-status-dot red pulse" />
            <span style={{ color: 'var(--ct-red)', fontFamily: 'var(--ct-font-mono)', fontSize: '12px', fontWeight: 600 }}>
              {formatTime(elapsed)}
            </span>
          </div>
        )}
      </div>
      <div className="ct-panel-body">
        <p className="ct-text-body-sm ct-muted" style={{ marginBottom: '14px' }}>
          Speak naturally. ClinicoTrace structures the clinical note.
        </p>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          {/* Mic button */}
          <button
            id="ct-mic-btn"
            onClick={handleRecord}
            disabled={recording || demoPhase === 'done'}
            aria-label="Start clinical voice recording"
            style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: recording ? 'var(--ct-red-light)' : demoPhase === 'done' ? 'var(--ct-green-light)' : 'var(--ct-blue)',
              border: `2px solid ${recording ? 'var(--ct-red-border)' : demoPhase === 'done' ? 'var(--ct-green-border)' : 'var(--ct-blue-dark)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: recording || demoPhase === 'done' ? 'default' : 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
          >
            {demoPhase === 'done' ? (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--ct-green)' }}>
                <path d="M5 11l4 4 8-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ color: recording ? 'var(--ct-red)' : 'white' }}>
                <rect x="8" y="3" width="6" height="11" rx="3" fill="currentColor"/>
                <path d="M4 11c0 3.866 3.134 7 7 7s7-3.134 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M11 18v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>

          {/* Transcript area */}
          <div style={{ flex: 1 }}>
            <textarea
              className="ct-input ct-textarea"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Transcript will appear here as you speak, or type directly…"
              style={{ minHeight: '72px', fontFamily: 'var(--ct-font-sans)', fontSize: '13px' }}
            />
            <p className="ct-text-label ct-muted" style={{ marginTop: '4px' }}>
              Transcript is editable — review and correct before proceeding
            </p>
          </div>
        </div>

        {demoPhase === 'done' && (
          <div style={{ marginTop: '12px' }}>
            <button
              id="ct-extract-btn"
              className="ct-btn ct-btn-primary"
              onClick={() => onTranscript(transcript)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Extract medications from transcript
            </button>
          </div>
        )}

        {demoPhase === 'idle' && (
          <div style={{
            marginTop: '12px', padding: '10px 12px', background: 'var(--ct-bg)',
            border: '1px solid var(--ct-border-subtle)', borderRadius: 'var(--ct-radius)',
          }}>
            <p className="ct-text-label ct-muted" style={{ marginBottom: '4px' }}>Demo transcript</p>
            <p className="ct-text-body-sm" style={{ color: 'var(--ct-text-secondary)', fontStyle: 'italic' }}>
              "{DEMO_VOICE_TRANSCRIPT}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Extraction Timeline ------------------------------------
function ExtractionTimeline({ currentStep }: { currentStep: ExtractionStep }) {
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

// ---- Extracted Medications ---------------------------------
function ExtractedMedicationsPanel({
  medications,
  visible,
}: {
  medications: Medication[];
  visible: boolean;
}) {
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

// ---- Safety Review -----------------------------------------
function SafetyReviewPanel({
  result,
  onAcknowledge,
  acknowledged,
}: {
  result: SafetyEvalResult;
  onAcknowledge: (findingId: string) => void;
  acknowledged: Set<string>;
}) {
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

function SafetyFindingCard({
  finding,
  expanded,
  onToggle,
  acknowledged,
  onAcknowledge,
}: {
  finding: SafetyFinding;
  expanded: boolean;
  onToggle: () => void;
  acknowledged: boolean;
  onAcknowledge: () => void;
}) {
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

// ---- Clinical Authorization --------------------------------
function ClinicalAuthorizationPanel({
  patient,
  medications,
  findings,
  acknowledged,
  onAuthorize,
  authorized,
}: {
  patient: Patient;
  medications: Medication[];
  findings: SafetyFinding[];
  acknowledged: Set<string>;
  onAuthorize: () => void;
  authorized: boolean;
}) {
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
          {' '}Expand each finding and click "Mark as Reviewed" to proceed.
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

// ---- Patient Instructions ----------------------------------
function PatientInstructionsPanel({ patient, medications }: { patient: Patient; medications: Medication[] }) {
  const [lang, setLang] = useState<SupportedLanguage>('ta');
  const [audioPlaying, setAudioPlaying] = useState(false);

  const instructions = getArunKumarInstructions(lang);

  const handleAudio = () => {
    setAudioPlaying(true);
    setTimeout(() => setAudioPlaying(false), 3000);
  };

  return (
    <div className="ct-panel">
      <div className="ct-panel-header">
        <span className="ct-text-head-sm">{SECTION_LABELS.title[lang]}</span>
        <span className="ct-badge ct-badge-green">Generated from verified prescription</span>
      </div>
      <div className="ct-panel-body">
        {/* Language selector */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {(Object.keys(LANGUAGE_LABELS) as SupportedLanguage[]).map((l) => (
            <button
              key={l}
              id={`ct-lang-${l}`}
              className={`ct-lang-tab${lang === l ? ' active' : ''}`}
              onClick={() => setLang(l)}
              aria-label={`Switch to ${LANGUAGE_LABELS[l]}`}
            >
              {LANGUAGE_LABELS[l]}
            </button>
          ))}
        </div>

        {/* Source note */}
        <p className="ct-text-body-sm ct-muted" style={{ marginBottom: '14px', fontStyle: 'italic' }}>
          {SECTION_LABELS.generatedFrom[lang]}
        </p>

        {/* Instructions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {instructions.map((inst, i) => (
            <div key={i} style={{
              border: '1px solid var(--ct-border)',
              borderRadius: 'var(--ct-radius-md)',
              overflow: 'hidden',
              background: 'var(--ct-surface)',
            }}>
              {/* Med header */}
              <div style={{
                padding: '10px 14px',
                background: 'var(--ct-surface-raised)',
                borderBottom: '1px solid var(--ct-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <span className="ct-text-head-sm" style={{ color: 'var(--ct-text-primary)', fontFamily: 'var(--ct-font-mono)' }}>
                  {inst.medicationName}
                </span>
                <span className="ct-badge ct-badge-blue">{inst.strength}</span>
                <span className="ct-text-label ct-muted" style={{ fontSize: '10px' }}>
                  (Clinical name — not translated)
                </span>
              </div>

              {/* Timing slots */}
              <div style={{ padding: '0 14px' }}>
                {inst.timingSlots.map((slot, j) => (
                  <div key={j} className="ct-instruction-slot">
                    <div>
                      <div className="ct-field-label">{slot.time}</div>
                      <div className="ct-text-body" style={{ fontWeight: 600, color: 'var(--ct-text-primary)', fontSize: '14px', marginTop: '2px' }}>{slot.dose}</div>
                    </div>
                    <div>
                      {slot.when && (
                        <span className="ct-text-body-sm" style={{ color: 'var(--ct-text-secondary)' }}>
                          {slot.when}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {(inst.specialNote || inst.cautionNote) && (
                <div style={{ padding: '10px 14px', borderTop: '1px solid var(--ct-border-subtle)' }}>
                  {inst.specialNote && (
                    <div className="ct-alert ct-alert-blue" style={{ marginBottom: '6px', fontSize: '12px', padding: '8px 10px' }}>
                      <strong>{SECTION_LABELS.importantNote[lang]}: </strong>{inst.specialNote}
                    </div>
                  )}
                  {inst.cautionNote && (
                    <div className="ct-alert ct-alert-amber" style={{ fontSize: '12px', padding: '8px 10px' }}>
                      <strong>{SECTION_LABELS.caution[lang]}: </strong>{inst.cautionNote}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', alignItems: 'center' }}>
          <button id="ct-print-btn" className="ct-btn ct-btn-secondary ct-btn-sm">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="2" y="1" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M4 7v4h5V7" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M2 4h9v5H2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
            Print
          </button>

          {/* Audio — accessibility */}
          <button
            id="ct-audio-btn"
            className="ct-btn ct-btn-secondary ct-btn-sm"
            onClick={handleAudio}
            aria-label="Play patient instructions audio"
            style={{ borderColor: audioPlaying ? 'var(--ct-blue)' : undefined }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {audioPlaying ? (
                <>
                  <div className="ct-status-dot blue pulse" />
                  <span>Playing…</span>
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M3 4.5L8 2v9L3 8.5H1V4.5h2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                    <path d="M9.5 4.5c.8.6 1.5 1.5 1.5 2s-.7 1.4-1.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  Play Audio
                </>
              )}
            </div>
          </button>
          <span className="ct-text-label ct-muted">Accessibility audio in {LANGUAGE_LABELS[lang]}</span>
        </div>
      </div>
    </div>
  );
}

// ---- Access Policy Panel -----------------------------------
function AccessPolicyPanel({ user }: { user: { name: string; role: UserRole } }) {
  const [show, setShow] = useState(false);
  const principal: Principal = {
    id: 'p-001',
    name: user.name,
    role: user.role,
    department: 'General Medicine',
    hospitalUnit: 'OPD',
  };

  const permissions = authzProvider.listPermissions(principal);
  const allowed = permissions.filter((p) => p.effect === 'ALLOW');
  const denied = permissions.filter((p) => p.effect === 'DENY');

  // Demo: check prescribe on patient:clinical
  const prescribeDecision = authzProvider.decide(principal, 'prescribe', 'patient:clinical');

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

// ---- Patient Selector --------------------------------------
function PatientSelector({ onSelect }: { onSelect: (p: Patient) => void }) {
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

// ============================================================
// MAIN DOCTOR WORKSTATION PAGE
// ============================================================

export default function DoctorPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: UserRole; unit: string } | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowStep>('patient_select');
  const [transcript, setTranscript] = useState('');
  const [extractionStep, setExtractionStep] = useState<ExtractionStep>('idle');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [safetyResult, setSafetyResult] = useState<SafetyEvalResult | null>(null);
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const [authorized, setAuthorized] = useState(false);
  const [rightPanel, setRightPanel] = useState<'safety' | 'access' | 'instructions'>('safety');

  useEffect(() => {
    const stored = sessionStorage.getItem('ct_user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'doctor') { router.push(`/${u.role}`); return; }
    setUser(u);
  }, [router]);

  const runExtraction = useCallback(async (t: string) => {
    if (!patient) return;
    setWorkflow('extracting');

    // Run extraction steps progressively
    for (const step of EXTRACTION_STEPS) {
      setExtractionStep(step.key as ExtractionStep);
      await new Promise((r) => setTimeout(r, step.duration));
    }

    setMedications(DEMO_EXTRACTED_MEDICATIONS as Medication[]);
    setExtractionStep('complete');
    setWorkflow('review_extraction');

    // Auto-run safety
    setWorkflow('safety_running');
    const result = await safetyProvider.evaluate(patient, DEMO_EXTRACTED_MEDICATIONS as Medication[]);
    setSafetyResult(result);
    setWorkflow('safety_review');
  }, [patient]);

  const handleAcknowledge = (findingId: string) => {
    setAcknowledged((prev) => {
      const next = new Set(prev);
      next.add(findingId);
      return next;
    });
  };

  const handleAuthorize = () => {
    setAuthorized(true);
    setWorkflow('patient_communication');
    setRightPanel('instructions');
  };

  if (!user) return <div style={{ padding: '40px', color: 'var(--ct-text-muted)' }}>Loading…</div>;

  const showWorkstation = workflow !== 'patient_select';
  const showMiddle = workflow !== 'patient_select' && workflow !== 'input';
  const showAuth = (workflow === 'safety_review' || workflow === 'authorization' || workflow === 'patient_communication') && medications.length > 0;
  const showInstructions = authorized;

  return (
    <div className="ct-shell">
      <NavRail active="patients" />
      <TopHeader user={user} patient={patient} />

      <main className="ct-main">
        {/* Demo banner */}
        <div className="ct-demo-banner">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 4v4M6 3v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Demo Mode — Bharat Build Hackathon 2026 · Deterministic mock data · Not for clinical use ·
          Safety rules: BNF 86 · Authz: In-memory Cedar policy · Not connected to Bedrock or AWS Cedar
        </div>

        {!showWorkstation ? (
          <PatientSelector onSelect={(p) => {
            setPatient(p);
            setWorkflow('input');
          }} />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '220px 1fr 340px',
            gap: '12px',
            padding: '12px',
            height: 'calc(100vh - var(--ct-header-height) - 29px)',
            overflow: 'hidden',
          }}>
            {/* LEFT: Patient context */}
            <div style={{ overflowY: 'auto' }}>
              {patient && <PatientContextPanel patient={patient} />}
            </div>

            {/* MIDDLE: Input + Extraction + Auth */}
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Voice Input */}
              <VoiceInputPanel
                onTranscript={runExtraction}
                transcript={transcript}
                setTranscript={setTranscript}
              />

              {/* Extraction Timeline */}
              {(workflow === 'extracting' || workflow === 'review_extraction' ||
                workflow === 'safety_running' || workflow === 'safety_review' ||
                workflow === 'patient_communication') && (
                <ExtractionTimeline currentStep={extractionStep} />
              )}

              {/* Extracted medications */}
              {(workflow === 'review_extraction' || workflow === 'safety_running' ||
                workflow === 'safety_review' || workflow === 'patient_communication') && (
                <ExtractedMedicationsPanel medications={medications} visible={medications.length > 0} />
              )}

              {/* Authorization */}
              {showAuth && patient && safetyResult && (
                <ClinicalAuthorizationPanel
                  patient={patient}
                  medications={medications}
                  findings={safetyResult.findings}
                  acknowledged={acknowledged}
                  onAuthorize={handleAuthorize}
                  authorized={authorized}
                />
              )}
            </div>

            {/* RIGHT: Safety + Instructions + Access */}
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Tab switcher */}
              {(workflow === 'safety_review' || workflow === 'patient_communication') && (
                <div style={{ display: 'flex', gap: '4px', background: 'var(--ct-bg-alt)', padding: '3px', borderRadius: 'var(--ct-radius)', border: '1px solid var(--ct-border)' }}>
                  {(['safety', 'instructions', 'access'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setRightPanel(tab)}
                      style={{
                        flex: 1, padding: '5px 8px', fontSize: '11px', fontWeight: 600,
                        borderRadius: '4px', border: 'none', cursor: 'pointer',
                        background: rightPanel === tab ? 'var(--ct-surface)' : 'transparent',
                        color: rightPanel === tab ? 'var(--ct-blue)' : 'var(--ct-text-muted)',
                        boxShadow: rightPanel === tab ? 'var(--ct-shadow-xs)' : 'none',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        transition: 'all 0.15s',
                      }}
                    >
                      {tab === 'safety' ? 'Safety' : tab === 'instructions' ? 'Patient Rx' : 'Access'}
                    </button>
                  ))}
                </div>
              )}

              {/* Safety running indicator */}
              {workflow === 'safety_running' && (
                <div className="ct-panel">
                  <div className="ct-panel-body" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="ct-status-dot blue pulse" />
                    <span className="ct-text-ui">Running deterministic safety evaluation…</span>
                  </div>
                </div>
              )}

              {/* Safety review panel */}
              {safetyResult && rightPanel === 'safety' && (
                <SafetyReviewPanel
                  result={safetyResult}
                  onAcknowledge={handleAcknowledge}
                  acknowledged={acknowledged}
                />
              )}

              {/* Patient instructions */}
              {showInstructions && rightPanel === 'instructions' && patient && (
                <PatientInstructionsPanel patient={patient} medications={medications} />
              )}

              {/* Access policy */}
              {(workflow === 'safety_review' || workflow === 'patient_communication') && rightPanel === 'access' && (
                <AccessPolicyPanel user={user} />
              )}

              {/* Waiting for input */}
              {workflow === 'input' && (
                <div className="ct-panel">
                  <div className="ct-panel-header">
                    <span className="ct-text-head-sm">Safety Intelligence</span>
                  </div>
                  <div className="ct-panel-body">
                    <p className="ct-text-body-sm ct-muted">
                      Safety evaluation will run automatically after prescription extraction.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
