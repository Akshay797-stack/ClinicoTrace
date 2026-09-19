'use client';

// ============================================================
// ClinicoTrace — VoiceInputPanel
// Extracted from doctor/page.tsx (Stage 1 refactor).
// No behavior change. Identical rendering + animation.
// ============================================================

import { useState } from 'react';
import { DEMO_VOICE_TRANSCRIPT } from '@/data/demoPatients';

interface VoiceInputPanelProps {
  onTranscript: (t: string) => void;
  transcript: string;
  setTranscript: (t: string) => void;
}

export function VoiceInputPanel({ onTranscript, transcript, setTranscript }: VoiceInputPanelProps) {
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
              &ldquo;{DEMO_VOICE_TRANSCRIPT}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
