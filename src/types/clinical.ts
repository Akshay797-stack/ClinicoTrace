// ============================================================
// ClinicoTrace — Clinical Domain Types
// ============================================================

// ---- Patient -----------------------------------------------

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: 'M' | 'F' | 'Other';
  conditions: string[];
  allergies: string[];
  currentMedications: CurrentMedication[];
  bloodGroup?: string;
  weight?: number; // kg
  mrn?: string; // Medical Record Number
}

export interface CurrentMedication {
  name: string;
  genericName: string;
  strength: string;
  frequency: string;
  route: string;
  prescribedFor: string;
  prescribedDate?: string;
}

// ---- Medication (extracted/prescribed) ----------------------

export type MedicationRoute = 'Oral' | 'Nebulisation' | 'IV' | 'IM' | 'SC' | 'Topical' | 'Inhaled' | 'Sublingual' | 'Other';
export type FrequencyCode = 'OD' | 'BD' | 'TDS' | 'QID' | 'SOS' | 'Stat' | 'Weekly' | 'Other';

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  strength: string;
  dose: string;
  frequency: FrequencyCode | string;
  route: MedicationRoute;
  timing?: string;       // e.g. "after food", "at bedtime"
  duration?: string;     // e.g. "5 days", "1 month"
  instructions?: string; // free text
  extractionConfidence: number; // 0–1, from AI extraction
  requiresVerification: boolean;
}

// ---- Raw Clinical Input ------------------------------------

export type InputMode = 'voice' | 'image' | 'text';

export interface RawClinicalInput {
  mode: InputMode;
  transcript?: string;
  imageUrl?: string;
  text?: string;
  timestamp: string;
}

// ---- Extraction --------------------------------------------

export type ExtractionStep =
  | 'idle'
  | 'input_received'
  | 'medications_identified'
  | 'dosage_normalized'
  | 'entities_structured'
  | 'safety_validation'
  | 'complete'
  | 'error';

export interface ExtractionResult {
  medications: Medication[];
  rawTranscript?: string;
  extractedAt: string;
  confidence: number;
  requiresClinicianReview: boolean;
  providerName: string;
  isLive: boolean; // false = demo/mock
}

// ---- Clinical Rules ----------------------------------------

export type RuleType =
  | 'DDI'            // Drug-Drug Interaction
  | 'DAI'            // Drug-Allergy Interaction
  | 'DCI'            // Drug-Condition Interaction
  | 'DoseCheck'      // Dose out of range
  | 'DuplicateTherapy'
  | 'ContraIndication';

export type Severity = 'Critical' | 'Moderate' | 'Low' | 'Informational';

export interface ClinicalRule {
  ruleId: string;
  ruleType: RuleType;
  severity: Severity;
  // The medications or drug classes involved
  perpetratorDrug?: string;       // drug A (e.g. drug class or specific name)
  perpetratorGeneric?: string;
  objectDrug?: string;            // drug B
  objectGeneric?: string;
  condition?: string;             // for DCI rules
  // Evidence
  explanation: string;
  source: string;                 // e.g. "British National Formulary (BNF), Edition 86"
  sourceVersion: string;          // e.g. "BNF 86, September 2023"
  sourceUrl?: string;
  nfiReference?: string;          // NFI 2021 section, for dosage/formulary context only
  requiredClinicalAction: string;
  // Matching helpers (lowercase, for rule evaluation)
  matchTerms: string[];           // all drug names/classes that trigger this rule
}

// ---- Safety Findings ---------------------------------------

export type FindingStatus = 'active' | 'dismissed' | 'acknowledged';

export interface SafetyFinding {
  findingId: string;
  ruleId: string;
  ruleType: RuleType;
  severity: Severity;
  medications: string[];         // names of involved medications
  explanation: string;
  source: string;
  sourceVersion: string;
  requiredClinicalAction: string;
  status: FindingStatus;
  perpetuatingMedication?: string;
  objectMedication?: string;
}

export interface SafetyEvalResult {
  status: 'clear' | 'warning' | 'critical';
  findings: SafetyFinding[];
  checksPerformed: string[];
  evaluatedAt: string;
  providerName: string;
  isLive: boolean;
}

// ---- Authorization / Policy --------------------------------

export interface Principal {
  id: string;
  name: string;
  role: UserRole;
  department?: string;
  hospitalUnit?: string;
}

export type UserRole = 'doctor' | 'nurse' | 'pharmacist' | 'admin';

export interface PolicyRule {
  action: string;
  resource: string;
  roles: UserRole[];
  effect: 'ALLOW' | 'DENY';
}

export type PolicyDecision = {
  decision: 'ALLOW' | 'DENY';
  policyId: string;
  reason: string;
  providerName: string;
  isLive: boolean;
};

// ---- Authorization of Prescription -------------------------

export type AuthorizationStatus = 'pending' | 'authorized' | 'rejected' | 'modified';

export interface PrescriptionAuthorization {
  authorizationId: string;
  clinician: Principal;
  patientId: string;
  medications: Medication[];
  safetyFindings: SafetyFinding[];
  acknowledgedFindings: string[]; // findingIds acknowledged by clinician
  status: AuthorizationStatus;
  authorizedAt?: string;
  notes?: string;
}

// ---- Patient Communication ---------------------------------

export type SupportedLanguage = 'en' | 'ta' | 'hi' | 'te';

export interface MedicationInstruction {
  medicationName: string;
  strength: string;
  frequency: string;
  timing: string;
  duration?: string;
  specialInstructions?: string;
}

export interface PatientInstructionSet {
  patientId: string;
  language: SupportedLanguage;
  generatedAt: string;
  instructions: LocalizedMedicationInstruction[];
  sourceAuthorizationId: string;
  isGeneratedFromVerifiedPrescription: boolean;
}

export interface LocalizedMedicationInstruction {
  medicationName: string;         // Always displayed in clinical form (not localized)
  strength: string;               // Always clinical
  timingSlots: LocalizedTimingSlot[];
  specialNote?: string;           // Localized
  cautionNote?: string;           // Localized
}

export interface LocalizedTimingSlot {
  time: string;    // Localized e.g. "காலை" (morning in Tamil)
  dose: string;    // Localized e.g. "1 மாத்திரை"
  when?: string;   // Localized e.g. "உணவுக்குப் பிறகு"
}

// ---- Clinical Session State --------------------------------

export type WorkflowStep =
  | 'patient_select'
  | 'input'
  | 'extracting'
  | 'review_extraction'
  | 'safety_running'
  | 'safety_review'
  | 'authorization'
  | 'patient_communication'
  | 'complete';

export interface ClinicalSession {
  sessionId: string;
  patient: Patient | null;
  rawInput: RawClinicalInput | null;
  extraction: ExtractionResult | null;
  safetyResult: SafetyEvalResult | null;
  authorization: PrescriptionAuthorization | null;
  currentStep: WorkflowStep;
  startedAt: string;
}

// ---- Demo / Provider mode indicator ------------------------

export interface ProviderMetadata {
  providerName: string;
  isLive: boolean;
  description: string;
}
