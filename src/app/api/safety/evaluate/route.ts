// ============================================================
// ClinicoTrace — Safety Evaluation API Route
// POST /api/safety/evaluate
//
// Body: { patientId: string; medications: Medication[] }
//
// Returns: SafetyEvalResult
//
// IMPORTANT: This route performs deterministic rule evaluation.
// AI output MUST be validated and human-verified BEFORE calling this.
// The safety engine is purely deterministic — never AI-driven.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPatient } from '@/services/patients/patientService';
import { evaluatePrescriptionSafety } from '@/services/safety/safetyService';

// ---- Request schema ----------------------------------------
const EvaluateRequestSchema = z.object({
  patientId: z.string().min(1).max(50),
  medications: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1).max(200),
      genericName: z.string().min(1).max(200),
      strength: z.string().min(1).max(50),
      dose: z.string().min(1).max(50),
      frequency: z.string().max(20),
      route: z.string().max(50),
      timing: z.string().max(200).optional(),
      duration: z.string().max(100).optional(),
      instructions: z.string().max(500).optional(),
      extractionConfidence: z.number().min(0).max(1),
      requiresVerification: z.boolean(),
    })
  ).min(1).max(50),
  // Actor information for audit logging
  actorId: z.string().optional(),
  actorName: z.string().optional(),
  actorRole: z.string().optional(),
  sessionId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }

  const parsed = EvaluateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Request validation failed', details: parsed.error.format(), code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }

  const { patientId, medications, actorId, actorName, actorRole, sessionId } = parsed.data;

  // Get patient (service handles NOT_FOUND)
  const patientResult = await getPatient(patientId);
  if (!patientResult.success) {
    return NextResponse.json(
      { error: patientResult.error, code: patientResult.code },
      { status: patientResult.code === 'NOT_FOUND' ? 404 : 500 }
    );
  }

  // Run deterministic safety evaluation
  const safetyResult = await evaluatePrescriptionSafety(
    patientResult.data,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    medications as any,
    actorId ?? 'api',
    actorName ?? 'API Client',
    actorRole ?? 'system',
    sessionId,
  );

  if (!safetyResult.success) {
    return NextResponse.json(
      { error: safetyResult.error, code: safetyResult.code },
      { status: 503 }
    );
  }

  return NextResponse.json({ result: safetyResult.data }, { status: 200 });
}
