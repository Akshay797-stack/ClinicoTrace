// ============================================================
// ClinicoTrace — Authorization Service
// Server-callable wrapper around IAuthzProvider.
//
// IMPORTANT: All authorization decisions MUST happen server-side.
// Never trust role or permission claims sent from the browser.
//
// Stage 1: Uses DemoAuthzProvider (in-memory Cedar-style policies).
// Stage 6: Integrates with actual session + server-side enforcement.
// Production: Amazon Verified Permissions + Cedar policy language.
// ============================================================

import type { Principal, PolicyDecision } from '@/types/clinical';
import { providerRegistry } from '@/providers/registry';
import { logAuditEvent } from '@/services/audit/auditService';

/**
 * Evaluate whether a principal may perform an action on a resource.
 *
 * Returns a PolicyDecision (ALLOW/DENY) with the policy ID and reason.
 * DENY decisions are logged to the audit trail.
 */
export function authorizeAction(
  principal: Principal,
  action: string,
  resource: string,
  sessionId?: string,
): PolicyDecision {
  const decision = providerRegistry.authz.decide(principal, action, resource);

  if (decision.decision === 'DENY') {
    logAuditEvent(
      principal.name,
      principal.id,
      principal.role,
      'ACCESS_DENIED',
      resource,
      {
        action,
        policyId: decision.policyId,
        providerName: decision.providerName,
      },
      sessionId,
    );
  }

  return decision;
}

/**
 * List all explicit permissions (ALLOW + DENY) for a principal.
 * Used to display the Cedar-style policy panel in the UI.
 */
export function listPrincipalPermissions(
  principal: Principal,
): Array<{ action: string; resource: string; effect: 'ALLOW' | 'DENY' }> {
  return providerRegistry.authz.listPermissions(principal);
}

/**
 * Check if a principal has a specific permission.
 * Convenience wrapper over authorizeAction.
 */
export function hasPermission(
  principal: Principal,
  action: string,
  resource: string,
): boolean {
  const decision = providerRegistry.authz.decide(principal, action, resource);
  return decision.decision === 'ALLOW';
}
