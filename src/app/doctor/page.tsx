'use client';

// ============================================================
// ClinicoTrace — Doctor Workstation Page
// Stage 1 refactor: Component extraction complete.
// This file is now state orchestration only (~200 lines).
//
// Components: src/components/shell/, src/components/workstation/
// Services:   src/services/ (safety, extraction, authz, audit)
// API routes: src/app/api/
//
// Demo flow preserved:
//   Login → Patient Select → Voice Input → Extract → Safety Review
//   → Acknowledge Findings → Authorize → Tamil Instructions
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_EXTRACTED_MEDICATIONS } from '@/data/demoPatients';
import { DemoSafetyProvider } from '@/providers/demo/DemoSafetyProvider';
import type {
  Patient, Medication, SafetyEvalResult, WorkflowStep,
  ExtractionStep, UserRole,
} from '@/types/clinical';
import { logAuditEvent } from '@/services/audit/auditService';

// ---- Shell components --------------------------------------
import { NavRail } from '@/components/shell/NavRail';
import { TopHeader } from '@/components/shell/TopHeader';

// ---- Workstation components --------------------------------
import { PatientSelector } from '@/components/workstation/PatientSelector';
import { PatientContextPanel } from '@/components/workstation/PatientContextPanel';
import { VoiceInputPanel } from '@/components/workstation/VoiceInputPanel';
import { ExtractionTimeline } from '@/components/workstation/ExtractionTimeline';
import { ExtractedMedicationsPanel } from '@/components/workstation/ExtractedMedicationsPanel';
import { SafetyReviewPanel } from '@/components/workstation/SafetyReviewPanel';
import { ClinicalAuthorizationPanel } from '@/components/workstation/ClinicalAuthorizationPanel';
import { PatientInstructionsPanel } from '@/components/workstation/PatientInstructionsPanel';
import { AccessPolicyPanel } from '@/components/workstation/AccessPolicyPanel';

// ---- Constants ---------------------------------------------

// Provider instance (module-level, as before — Stage 2 will route through service layer)
const safetyProvider = new DemoSafetyProvider();

const EXTRACTION_STEPS: { key: ExtractionStep; label: string; duration: number }[] = [
  { key: 'input_received',         label: 'Input received',                duration: 800  },
  { key: 'medications_identified', label: 'Medications identified',         duration: 1400 },
  { key: 'dosage_normalized',      label: 'Dosage & frequency normalized',  duration: 1200 },
  { key: 'entities_structured',    label: 'Clinical entities structured',   duration: 1000 },
  { key: 'safety_validation',      label: 'Dispatching to safety engine…', duration: 800  },
];

// ============================================================
// DOCTOR WORKSTATION — STATE ORCHESTRATION
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

  // ---- Session guard ----------------------------------------
  useEffect(() => {
    const stored = sessionStorage.getItem('ct_user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'doctor') { router.push(`/${u.role}`); return; }
    setUser(u);
  }, [router]);

  // ---- Patient selection ------------------------------------
  const handlePatientSelect = useCallback((p: Patient) => {
    setPatient(p);
    setWorkflow('input');

    if (user) {
      logAuditEvent(user.name, 'u-001', user.role, 'PATIENT_VIEWED', `patient:${p.id}`, {
        patientName: p.name,
      });
    }
  }, [user]);

  // ---- Extraction + safety pipeline -------------------------
  const runExtraction = useCallback(async (t: string) => {
    if (!patient || !user) return;
    setWorkflow('extracting');

    logAuditEvent(user.name, 'u-001', user.role, 'VOICE_INPUT_COMPLETED', `patient:${patient.id}`, {
      transcriptLength: t.length,
    });

    logAuditEvent(user.name, 'u-001', user.role, 'EXTRACTION_STARTED', `patient:${patient.id}`, {
      providerName: 'DemoExtractionProvider',
      isLive: false,
    });

    // Run extraction steps progressively (demo animation)
    for (const step of EXTRACTION_STEPS) {
      setExtractionStep(step.key as ExtractionStep);
      await new Promise((r) => setTimeout(r, step.duration));
    }

    setMedications(DEMO_EXTRACTED_MEDICATIONS as Medication[]);
    setExtractionStep('complete');
    setWorkflow('review_extraction');

    logAuditEvent(user.name, 'u-001', user.role, 'EXTRACTION_COMPLETED', `patient:${patient.id}`, {
      medicationCount: DEMO_EXTRACTED_MEDICATIONS.length,
      isLive: false,
    });

    // Auto-run safety evaluation
    setWorkflow('safety_running');

    logAuditEvent(user.name, 'u-001', user.role, 'SAFETY_EVALUATION_STARTED', `patient:${patient.id}`, {
      providerName: 'DemoSafetyProvider',
      isLive: false,
    });

    const result = await safetyProvider.evaluate(patient, DEMO_EXTRACTED_MEDICATIONS as Medication[]);
    setSafetyResult(result);
    setWorkflow('safety_review');

    logAuditEvent(user.name, 'u-001', user.role, 'SAFETY_EVALUATION_COMPLETED', `patient:${patient.id}`, {
      status: result.status,
      findingCount: result.findings.length,
      isLive: false,
    });
  }, [patient, user]);

  // ---- Acknowledge safety finding ---------------------------
  const handleAcknowledge = useCallback((findingId: string) => {
    setAcknowledged((prev) => {
      const next = new Set(prev);
      next.add(findingId);
      return next;
    });

    if (user && patient) {
      logAuditEvent(user.name, 'u-001', user.role, 'SAFETY_FINDING_ACKNOWLEDGED', `patient:${patient.id}`, {
        findingId,
      });
    }
  }, [user, patient]);

  // ---- Authorize prescription --------------------------------
  const handleAuthorize = useCallback(() => {
    setAuthorized(true);
    setWorkflow('patient_communication');
    setRightPanel('instructions');

    if (user && patient) {
      logAuditEvent(user.name, 'u-001', user.role, 'PRESCRIPTION_AUTHORIZED', `patient:${patient.id}`, {
        medicationCount: medications.length,
        findingCount: safetyResult?.findings.length ?? 0,
      });

      logAuditEvent(user.name, 'u-001', user.role, 'INSTRUCTIONS_GENERATED', `patient:${patient.id}`, {
        language: 'ta',
      });
    }
  }, [user, patient, medications.length, safetyResult]);

  // ---- Loading guard ----------------------------------------
  if (!user) return <div style={{ padding: '40px', color: 'var(--ct-text-muted)' }}>Loading…</div>;

  // ---- Derived view state -----------------------------------
  const showWorkstation = workflow !== 'patient_select';
  const showMiddle = workflow !== 'patient_select' && workflow !== 'input';
  const showAuth = (workflow === 'safety_review' || workflow === 'authorization' || workflow === 'patient_communication') && medications.length > 0;
  const showInstructions = authorized;

  // Suppress unused variable warning for showMiddle (used in future stages)
  void showMiddle;

  // ---- Render -----------------------------------------------
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
          <PatientSelector onSelect={handlePatientSelect} />
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
