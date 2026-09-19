// ============================================================
// ClinicoTrace — Extraction Service
// Wraps IExtractionProvider. Adds Zod schema validation.
//
// CRITICAL PRINCIPLE: LLM output is UNTRUSTED input.
// Every field from AI extraction MUST pass schema validation
// before entering the clinical pipeline.
//
// Pipeline:
//   AI Provider
//     → Zod schema validation
//       → requiresClinicianReview = true (always for AI output)
//         → Human verification in UI
//           → Deterministic safety engine
//             → Doctor authorization
// ============================================================

import { z } from 'zod';
import type { RawClinicalInput, ExtractionResult, Medication } from '@/types/clinical';
import type { ServiceResponse } from '@/services/types';
import { ok, err } from '@/services/types';
import { providerRegistry } from '@/providers/registry';
import { logAuditEvent } from '@/services/audit/auditService';

// ---- Zod schema: AI-extracted medication --------------------
// Every field returned by the AI must conform to this schema.
// Any validation failure is caught here — never propagated as clinical data.

const MedicationRouteSchema = z.enum([
  'Oral', 'Nebulisation', 'IV', 'IM', 'SC', 'Topical', 'Inhaled', 'Sublingual', 'Other',
]);

const FrequencyCodeSchema = z.enum([
  'OD', 'BD', 'TDS', 'QID', 'SOS', 'Stat', 'Weekly', 'Other',
]).or(z.string().max(20));

const ExtractedMedicationSchema = z.object({
  id: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  genericName: z.string().min(1).max(200),
  strength: z.string().min(1).max(50),
  dose: z.string().min(1).max(50),
  frequency: FrequencyCodeSchema,
  route: MedicationRouteSchema,
  timing: z.string().max(200).optional(),
  duration: z.string().max(100).optional(),
  instructions: z.string().max(500).optional(),
  extractionConfidence: z.number().min(0).max(1),
  requiresVerification: z.boolean(),
});

const ExtractionResultSchema = z.object({
  medications: z.array(ExtractedMedicationSchema).max(50),
  rawTranscript: z.string().max(5000).optional(),
  extractedAt: z.string(),
  confidence: z.number().min(0).max(1),
  requiresClinicianReview: z.literal(true), // MUST always be true for AI output
  providerName: z.string(),
  isLive: z.boolean(),
});

/**
 * Extract structured medications from raw clinical input.
 *
 * Returns a validation-safe ExtractionResult.
 * If Zod validation fails, returns EXTRACTION_FAILED — never corrupt data.
 */
export async function extractFromInput(
  input: RawClinicalInput,
  actorId: string = 'system',
  actorName: string = 'System',
  actorRole: string = 'system',
  sessionId?: string,
): Promise<ServiceResponse<ExtractionResult>> {
  logAuditEvent(actorName, actorId, actorRole, 'EXTRACTION_STARTED', `input:${input.mode}`, {
    mode: input.mode,
    providerName: providerRegistry.extraction.providerName,
    isLive: providerRegistry.extraction.isLive,
  }, sessionId);

  try {
    const rawResult = await providerRegistry.extraction.extract(input);

    // ---- Zod validation: AI output is UNTRUSTED ---------------
    // Force requiresClinicianReview = true regardless of what the AI returned
    const toValidate = {
      ...rawResult,
      requiresClinicianReview: true as const,
    };

    const parseResult = ExtractionResultSchema.safeParse(toValidate);

    if (!parseResult.success) {
      console.error('[ExtractionService] Schema validation failed:', parseResult.error.format());
      logAuditEvent(actorName, actorId, actorRole, 'EXTRACTION_FAILED', `input:${input.mode}`, {
        reason: 'schema_validation_failed',
      }, sessionId);
      return err(
        'Clinical extraction could not be completed. The AI output failed schema validation. Please verify the prescription manually.',
        'EXTRACTION_FAILED',
      );
    }

    const validated = parseResult.data as ExtractionResult;

    logAuditEvent(actorName, actorId, actorRole, 'EXTRACTION_COMPLETED', `input:${input.mode}`, {
      medicationCount: validated.medications.length,
      providerName: validated.providerName,
      isLive: validated.isLive,
    }, sessionId);

    return ok(validated);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[ExtractionService] Provider error:', message);
    logAuditEvent(actorName, actorId, actorRole, 'EXTRACTION_FAILED', `input:${input.mode}`, {
      reason: 'provider_error',
    }, sessionId);
    return err(
      'Clinical extraction could not be completed. Please verify the prescription manually.',
      'EXTRACTION_FAILED',
    );
  }
}

/**
 * Export the Medication schema for reuse in API route validation.
 */
export { ExtractedMedicationSchema, ExtractionResultSchema };
export type ValidatedMedication = z.infer<typeof ExtractedMedicationSchema>;
