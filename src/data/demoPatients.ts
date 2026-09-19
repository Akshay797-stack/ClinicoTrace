// ============================================================
// ClinicoTrace — Demo Patient Data
// Deterministic fixtures — clearly labelled as DEMO DATA
// ============================================================

import type { Patient } from '@/types/clinical';

export const DEMO_PATIENTS: Patient[] = [
  {
    id: 'CT-2026-00124',
    mrn: 'MRN-AK-00124',
    name: 'Arun Kumar',
    age: 54,
    sex: 'M',
    bloodGroup: 'B+',
    weight: 72,
    conditions: ['Type 2 Diabetes Mellitus', 'Hypertension'],
    allergies: [], // No known drug allergies
    currentMedications: [
      {
        name: 'Atenolol',
        genericName: 'atenolol',
        strength: '50mg',
        frequency: 'OD',
        route: 'Oral',
        prescribedFor: 'Hypertension',
        prescribedDate: '2026-03-10',
      },
      {
        name: 'Metformin',
        genericName: 'metformin',
        strength: '500mg',
        frequency: 'BD',
        route: 'Oral',
        prescribedFor: 'Type 2 Diabetes Mellitus',
        prescribedDate: '2025-11-15',
      },
    ],
  },
  {
    id: 'CT-2026-00097',
    mrn: 'MRN-MD-00097',
    name: 'Meena Devi',
    age: 38,
    sex: 'F',
    bloodGroup: 'O+',
    weight: 58,
    conditions: ['Upper Respiratory Tract Infection'],
    allergies: [],
    currentMedications: [],
  },
];

// Demo prescription transcript (voice dictation simulation)
export const DEMO_VOICE_TRANSCRIPT =
  'Patient presenting with acute breathlessness and wheeze for one day. ' +
  'Background of hypertension on Atenolol 50mg. ' +
  'Start Salbutamol 2.5mg nebulisation three times daily. ' +
  'Tab Prednisolone 30mg once daily for five days. ' +
  'Tab Azithromycin 500mg once daily for three days.';

// Pre-extraction demo result (what the AI extraction step produces)
export const DEMO_EXTRACTED_MEDICATIONS = [
  {
    id: 'med-001',
    name: 'Salbutamol Nebulisation',
    genericName: 'salbutamol',
    strength: '2.5mg',
    dose: '2.5mg',
    frequency: 'TDS',
    route: 'Nebulisation' as const,
    timing: 'As directed',
    duration: 'Until review',
    instructions: 'Via nebuliser mask. Monitor response.',
    extractionConfidence: 0.96,
    requiresVerification: false,
  },
  {
    id: 'med-002',
    name: 'Prednisolone',
    genericName: 'prednisolone',
    strength: '30mg',
    dose: '30mg',
    frequency: 'OD',
    route: 'Oral' as const,
    timing: 'After food',
    duration: '5 days',
    instructions: 'Do not stop abruptly.',
    extractionConfidence: 0.98,
    requiresVerification: false,
  },
  {
    id: 'med-003',
    name: 'Azithromycin',
    genericName: 'azithromycin',
    strength: '500mg',
    dose: '500mg',
    frequency: 'OD',
    route: 'Oral' as const,
    timing: 'At least 1 hour before or 2 hours after food',
    duration: '3 days',
    instructions: 'Complete the full course.',
    extractionConfidence: 0.97,
    requiresVerification: false,
  },
];

// Meena Devi - clean prescription (no safety alerts)
export const DEMO_VOICE_TRANSCRIPT_MEENA =
  'Patient with upper respiratory tract infection. ' +
  'Tab Paracetamol 500mg three times daily after food for 3 days. ' +
  'Tab Cetirizine 10mg at bedtime for 5 days. ' +
  'Steam inhalation twice daily.';
