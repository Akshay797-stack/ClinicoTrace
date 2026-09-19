// ============================================================
// ClinicoTrace — Patient Service
// Stage 1: Backed by in-memory demo fixtures.
// Stage 2: Will be replaced by Prisma + PostgreSQL queries.
// ============================================================

import type { Patient } from '@/types/clinical';
import { DEMO_PATIENTS } from '@/data/demoPatients';
import type { ServiceResponse } from '@/services/types';
import { ok, err } from '@/services/types';

// Stage 1: In-memory source. Stage 2: DB.
let _patients: Patient[] = [...DEMO_PATIENTS];

/**
 * Get a single patient by ID.
 * Returns NOT_FOUND if the patient doesn't exist.
 */
export async function getPatient(id: string): Promise<ServiceResponse<Patient>> {
  // Simulate brief async latency (realistic; production will have DB round-trip)
  await new Promise((r) => setTimeout(r, 5));
  const patient = _patients.find((p) => p.id === id);
  if (!patient) {
    return err(`Patient ${id} not found`, 'NOT_FOUND');
  }
  return ok(patient);
}

/**
 * Search patients by name or ID fragment.
 * Case-insensitive. Returns all matching patients.
 */
export async function searchPatients(query: string): Promise<ServiceResponse<Patient[]>> {
  await new Promise((r) => setTimeout(r, 5));
  const lower = query.toLowerCase().trim();
  if (!lower) {
    return ok([..._patients]);
  }
  const matches = _patients.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.id.toLowerCase().includes(lower) ||
      (p.mrn && p.mrn.toLowerCase().includes(lower))
  );
  return ok(matches);
}

/**
 * List all patients.
 * In Stage 3: Filtered by role permissions and department.
 */
export async function listPatients(): Promise<ServiceResponse<Patient[]>> {
  await new Promise((r) => setTimeout(r, 5));
  return ok([..._patients]);
}

// ---- Internal: for testing/seeding only --------------------

/**
 * @internal Used only by seed scripts and tests.
 * Not exposed via API routes.
 */
export function _seedPatients(patients: Patient[]): void {
  _patients = patients;
}

export function _resetPatients(): void {
  _patients = [...DEMO_PATIENTS];
}
