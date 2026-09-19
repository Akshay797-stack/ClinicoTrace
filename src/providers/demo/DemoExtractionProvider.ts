// ============================================================
// Demo Extraction Provider
// Implements IExtractionProvider using deterministic fixtures.
// isLive = false — UI MUST display "Demo Mode" badge.
// Does NOT call Amazon Bedrock or any external API.
// ============================================================

import type { IExtractionProvider } from '@/providers/interfaces';
import type { RawClinicalInput, ExtractionResult } from '@/types/clinical';
import { DEMO_EXTRACTED_MEDICATIONS } from '@/data/demoPatients';

// Simulate the progressive steps with realistic timing
const EXTRACTION_DELAY_MS = 2200;

export class DemoExtractionProvider implements IExtractionProvider {
  readonly providerName = 'demo-extraction-v1';
  readonly isLive = false;

  async extract(input: RawClinicalInput): Promise<ExtractionResult> {
    // Simulate extraction processing time
    await new Promise((r) => setTimeout(r, EXTRACTION_DELAY_MS));

    return {
      medications: DEMO_EXTRACTED_MEDICATIONS,
      rawTranscript: input.transcript,
      extractedAt: new Date().toISOString(),
      confidence: 0.97,
      requiresClinicianReview: true, // Always true — AI never auto-approves
      providerName: this.providerName,
      isLive: this.isLive,
    };
  }
}
