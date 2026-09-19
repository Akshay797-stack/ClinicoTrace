// ============================================================
// ClinicoTrace — Provider Interfaces
// Separation of Demo Mode vs Production (Bedrock / Cedar)
// ============================================================

import type {
  RawClinicalInput,
  ExtractionResult,
  Patient,
  Medication,
  SafetyEvalResult,
  Principal,
  PolicyDecision,
} from '@/types/clinical';

// ---- Extraction Provider -----------------------------------

/**
 * Extracts structured medication data from raw clinical input
 * (voice transcript, image, or freetext).
 *
 * Demo implementation: DemoExtractionProvider (deterministic fixtures)
 * Production implementation: BedrockExtractionProvider (Amazon Bedrock)
 */
export interface IExtractionProvider {
  readonly providerName: string;
  /**
   * false  → Demo Mode; the UI MUST display a visible "Demo Mode" badge
   *           and MUST NOT represent this as a live AI result.
   * true   → Production; results come from a live model endpoint.
   */
  readonly isLive: boolean;

  extract(input: RawClinicalInput): Promise<ExtractionResult>;
}

// ---- Safety Evaluation Provider ----------------------------

/**
 * Evaluates a set of prescribed medications against clinical safety rules.
 *
 * Demo implementation: DemoSafetyProvider (deterministic rule lookup)
 * Production implementation: could integrate with a clinical rules engine
 *                            or augment with AWS HealthLake / specialized service
 */
export interface ISafetyProvider {
  readonly providerName: string;
  readonly isLive: boolean;

  /**
   * Pure deterministic evaluation: same inputs always produce same outputs.
   * AI output MUST NEVER auto-authorize a prescription.
   */
  evaluate(patient: Patient, medications: Medication[]): Promise<SafetyEvalResult>;
}

// ---- Authorization Policy Provider -------------------------

/**
 * Evaluates whether a principal (user) is permitted to perform an action
 * on a clinical resource.
 *
 * Demo implementation: DemoAuthzProvider (in-memory Cedar-style policies)
 * Production implementation: CedarAuthzProvider (AWS Verified Permissions / Cedar)
 */
export interface IAuthzProvider {
  readonly providerName: string;
  readonly isLive: boolean;

  decide(principal: Principal, action: string, resource: string): PolicyDecision;
  listPermissions(principal: Principal): Array<{ action: string; resource: string; effect: 'ALLOW' | 'DENY' }>;
}

// ---- Composite Provider Registry ---------------------------

export interface ProviderRegistry {
  extraction: IExtractionProvider;
  safety: ISafetyProvider;
  authz: IAuthzProvider;
}
