// ============================================================
// ClinicoTrace — Safety Service
// Wraps ISafetyProvider. Adds structured logging and
// enforces the principle: deterministic rules, never AI.
//
// Stage 1: Uses DemoSafetyProvider.
// Stage 5: safetyEngine.ts (pure function) will be extracted here.
// ============================================================

import type { Patient, Medication, SafetyEvalResult } from '@/types/clinical';
import type { ServiceResponse } from '@/services/types';
import { ok, err } from '@/services/types';
import { providerRegistry } from '@/providers/registry';
import { logAuditEvent } from '@/services/audit/auditService';

/**
 * Evaluate a prescription against deterministic clinical safety rules.
 *
 * This is the ONLY entry point for safety evaluation.
 * AI output MUST NOT bypass this layer.
 * LLM output MUST be validated and human-verified BEFORE calling this function.
 */
export async function evaluatePrescriptionSafety(
  patient: Patient,
  medications: Medication[],
  actorId: string = 'system',
  actorName: string = 'System',
  actorRole: string = 'system',
  sessionId?: string,
): Promise<ServiceResponse<SafetyEvalResult>> {
  const resource = `patient:${patient.id}`;

  logAuditEvent(actorName, actorId, actorRole, 'SAFETY_EVALUATION_STARTED', resource, {
    medicationCount: medications.length,
    providerName: providerRegistry.safety.providerName,
    isLive: providerRegistry.safety.isLive,
  }, sessionId);

  try {
    const result = await providerRegistry.safety.evaluate(patient, medications);

    logAuditEvent(actorName, actorId, actorRole, 'SAFETY_EVALUATION_COMPLETED', resource, {
      status: result.status,
      findingCount: result.findings.length,
      providerName: result.providerName,
      isLive: result.isLive,
    }, sessionId);

    return ok(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[SafetyService] Evaluation failed:', message);

    // Safety engine UNAVAILABLE: must surface clearly to clinician.
    // NEVER silently skip safety evaluation.
    return err(
      'Clinical safety validation could not be completed. The prescription cannot be automatically cleared. Please verify medications manually.',
      'SAFETY_ENGINE_UNAVAILABLE',
    );
  }
}
