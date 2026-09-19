// ============================================================
// ClinicoTrace — Audit Service
// Records every important clinical action as an immutable event.
//
// Stage 1: In-memory store. Stage 7: Persist to DB (AuditEvent table).
// ============================================================

export type AuditAction =
  | 'PATIENT_VIEWED'
  | 'ENCOUNTER_STARTED'
  | 'PRESCRIPTION_CREATED'
  | 'MEDICATION_ADDED'
  | 'VOICE_INPUT_STARTED'
  | 'VOICE_INPUT_COMPLETED'
  | 'EXTRACTION_STARTED'
  | 'EXTRACTION_COMPLETED'
  | 'EXTRACTION_FAILED'
  | 'SAFETY_EVALUATION_STARTED'
  | 'SAFETY_EVALUATION_COMPLETED'
  | 'SAFETY_FINDING_ACKNOWLEDGED'
  | 'SAFETY_FINDING_DISMISSED'
  | 'PRESCRIPTION_AUTHORIZED'
  | 'PRESCRIPTION_MODIFIED'
  | 'INSTRUCTIONS_GENERATED'
  | 'INSTRUCTIONS_PRINTED'
  | 'PRESCRIPTION_DISPENSED'
  | 'MEDICATION_ADMINISTERED'
  | 'ACCESS_DENIED';

export interface AuditEvent {
  eventId: string;
  actor: string;       // user name
  actorId: string;     // user id
  role: string;
  action: AuditAction;
  resource: string;    // e.g. "patient:CT-2026-00124", "prescription:rx-001"
  timestamp: string;   // ISO8601
  metadata?: Record<string, string | number | boolean>;
  sessionId?: string;
}

// In-memory store — replaced by DB in Stage 7
const _auditLog: AuditEvent[] = [];

let _eventCounter = 0;

function generateEventId(): string {
  _eventCounter++;
  return `audit-${Date.now()}-${_eventCounter.toString().padStart(4, '0')}`;
}

/**
 * Log an audit event. Always succeeds — never throws.
 * In Stage 7 this will also persist to the AuditEvent table.
 */
export function logAuditEvent(
  actor: string,
  actorId: string,
  role: string,
  action: AuditAction,
  resource: string,
  metadata?: Record<string, string | number | boolean>,
  sessionId?: string,
): AuditEvent {
  const event: AuditEvent = {
    eventId: generateEventId(),
    actor,
    actorId,
    role,
    action,
    resource,
    timestamp: new Date().toISOString(),
    metadata,
    sessionId,
  };

  _auditLog.push(event);

  // Console log in development (non-sensitive — no raw patient data)
  if (process.env.NODE_ENV !== 'production') {
    console.info(
      `[AUDIT] ${event.timestamp} | ${event.role}:${event.actor} | ${event.action} | ${event.resource}`
    );
  }

  return event;
}

/**
 * Retrieve all audit events for a session or resource.
 * Returns newest-first.
 */
export function getAuditEvents(filter?: {
  sessionId?: string;
  resource?: string;
  actorId?: string;
}): AuditEvent[] {
  let events = [..._auditLog].reverse();

  if (filter?.sessionId) {
    events = events.filter((e) => e.sessionId === filter.sessionId);
  }
  if (filter?.resource) {
    events = events.filter((e) => e.resource.includes(filter.resource!));
  }
  if (filter?.actorId) {
    events = events.filter((e) => e.actorId === filter.actorId);
  }

  return events;
}

/**
 * Get recent events (for dashboard display).
 */
export function getRecentAuditEvents(limit = 50): AuditEvent[] {
  return [..._auditLog].reverse().slice(0, limit);
}
