// ============================================================
// ClinicoTrace — Single Patient API Route
// GET /api/patients/[id] → get patient by ID
// ============================================================
// Stage 1: Backed by demo fixtures.
// Stage 6: Will enforce server-side session + role permissions.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getPatient } from '@/services/patients/patientService';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await getPatient(id);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status: result.code === 'NOT_FOUND' ? 404 : 500 }
    );
  }

  return NextResponse.json({ patient: result.data }, { status: 200 });
}
