// ============================================================
// ClinicoTrace — Patients API Routes
// GET /api/patients         → list all patients
// GET /api/patients?q=query → search patients
// ============================================================
// Stage 1: Backed by demo fixtures via patientService.
// Stage 6: Will enforce server-side session + role check.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { listPatients, searchPatients } from '@/services/patients/patientService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  const result = query
    ? await searchPatients(query)
    : await listPatients();

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status: result.code === 'NOT_FOUND' ? 404 : 500 }
    );
  }

  return NextResponse.json({ patients: result.data }, { status: 200 });
}
