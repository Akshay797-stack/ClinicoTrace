'use client';

// ============================================================
// ClinicoTrace — PatientInstructionsPanel
// Extracted from doctor/page.tsx (Stage 1 refactor).
// No behavior change. Identical rendering.
// Stage 10: Will be generalized to any patient.
// ============================================================

import { useState } from 'react';
import { getArunKumarInstructions, LANGUAGE_LABELS, SECTION_LABELS } from '@/data/translations';
import type { Patient, Medication, SupportedLanguage } from '@/types/clinical';

interface PatientInstructionsPanelProps {
  patient: Patient;
  medications: Medication[];
}

export function PatientInstructionsPanel({ patient, medications: _medications }: PatientInstructionsPanelProps) {
  const [lang, setLang] = useState<SupportedLanguage>('ta');
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Stage 10: Replace getArunKumarInstructions with instructionService.generateInstructions(prescription, lang)
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
