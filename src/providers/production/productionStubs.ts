// ============================================================
// Production Provider Stubs
// These stubs exist as integration points for Amazon Bedrock
// and AWS Cedar (Verified Permissions).
// They are NOT used in demo mode and will throw clearly if
// accidentally invoked without a real backend configured.
// ============================================================

import type { IExtractionProvider, ISafetyProvider, IAuthzProvider } from '@/providers/interfaces';
import type {
  RawClinicalInput,
  ExtractionResult,
  Patient,
  Medication,
  SafetyEvalResult,
  Principal,
  PolicyDecision,
} from '@/types/clinical';

const NOT_IMPLEMENTED = (name: string) =>
  new Error(
    `[ClinicoTrace] ${name} is a production stub and is not implemented. ` +
    'Configure Amazon Bedrock credentials and endpoints before using this provider. ' +
    'In Demo Mode, use DemoExtractionProvider / DemoSafetyProvider / DemoAuthzProvider instead.'
  );

// ---- Bedrock Extraction Provider Stub ----------------------

/**
 * Production extraction provider.
 * Integration point: Amazon Bedrock (Claude / Titan model).
 * Configure via environment variables:
 *   BEDROCK_REGION, BEDROCK_MODEL_ID, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 */
export class BedrockExtractionProvider implements IExtractionProvider {
  readonly providerName = 'bedrock-claude';
  readonly isLive = true;

  async extract(_input: RawClinicalInput): Promise<ExtractionResult> {
    throw NOT_IMPLEMENTED('BedrockExtractionProvider.extract');
  }
}

// ---- Bedrock Safety Provider Stub --------------------------

/**
 * Production safety provider.
 * Reserved for a certified clinical rules engine or Bedrock-augmented
 * safety evaluation. Must integrate with a licensed DDI database.
 */
export class BedrockSafetyProvider implements ISafetyProvider {
  readonly providerName = 'bedrock-safety';
  readonly isLive = true;

  async evaluate(_patient: Patient, _medications: Medication[]): Promise<SafetyEvalResult> {
    throw NOT_IMPLEMENTED('BedrockSafetyProvider.evaluate');
  }
}

// ---- Cedar Authz Provider Stub -----------------------------

/**
 * Production authorization provider.
 * Integration point: AWS Verified Permissions (Cedar policy language).
 * Configure via environment variables:
 *   CEDAR_POLICY_STORE_ID, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 */
export class CedarAuthzProvider implements IAuthzProvider {
  readonly providerName = 'aws-verified-permissions';
  readonly isLive = true;

  decide(_principal: Principal, _action: string, _resource: string): PolicyDecision {
    throw NOT_IMPLEMENTED('CedarAuthzProvider.decide');
  }

  listPermissions(_principal: Principal): Array<{ action: string; resource: string; effect: 'ALLOW' | 'DENY' }> {
    throw NOT_IMPLEMENTED('CedarAuthzProvider.listPermissions');
  }
}
