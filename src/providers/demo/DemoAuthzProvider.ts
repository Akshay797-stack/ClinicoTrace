// ============================================================
// Demo Authorization Provider
// Cedar-style in-memory policy evaluation.
// isLive = false — not connected to AWS Verified Permissions.
// ============================================================

import type { IAuthzProvider } from '@/providers/interfaces';
import type { Principal, PolicyDecision, UserRole } from '@/types/clinical';

interface PolicyEntry {
  policyId: string;
  roles: UserRole[];
  actions: string[];
  resources: string[];
  effect: 'ALLOW' | 'DENY';
}

// In-memory Cedar-style policy store
// In production this would be evaluated by AWS Verified Permissions (Cedar)
const POLICIES: PolicyEntry[] = [
  {
    policyId: 'doctor-clinical-access',
    roles: ['doctor'],
    actions: ['read', 'write', 'prescribe', 'authorize'],
    resources: ['patient:clinical', 'prescription:*', 'safety:*'],
    effect: 'ALLOW',
  },
  {
    policyId: 'doctor-billing-deny',
    roles: ['doctor'],
    actions: ['read', 'write'],
    resources: ['billing:*', 'admin:*'],
    effect: 'DENY',
  },
  {
    policyId: 'nurse-clinical-limited',
    roles: ['nurse'],
    actions: ['read'],
    resources: ['patient:clinical', 'prescription:view', 'administration:*'],
    effect: 'ALLOW',
  },
  {
    policyId: 'nurse-prescribe-deny',
    roles: ['nurse'],
    actions: ['write', 'prescribe', 'authorize'],
    resources: ['prescription:*'],
    effect: 'DENY',
  },
  {
    policyId: 'pharmacist-dispensing-access',
    roles: ['pharmacist'],
    actions: ['read', 'dispense'],
    resources: ['prescription:view', 'prescription:dispense', 'patient:demographics'],
    effect: 'ALLOW',
  },
  {
    policyId: 'pharmacist-clinical-deny',
    roles: ['pharmacist'],
    actions: ['read', 'write'],
    resources: ['patient:clinical:full', 'safety:edit', 'billing:*'],
    effect: 'DENY',
  },
  {
    policyId: 'admin-operational-access',
    roles: ['admin'],
    actions: ['read'],
    resources: ['admin:dashboard', 'admin:metrics', 'billing:*'],
    effect: 'ALLOW',
  },
  {
    policyId: 'admin-prescribe-deny',
    roles: ['admin'],
    actions: ['write', 'prescribe', 'authorize'],
    resources: ['prescription:*', 'patient:clinical'],
    effect: 'DENY',
  },
];

// Per-role human-readable permission summary for the UI
export const ROLE_PERMISSIONS: Record<
  UserRole,
  { allowed: string[]; denied: string[] }
> = {
  doctor: {
    allowed: [
      'Patient clinical data (full)',
      'Prescription — read & write',
      'Safety review',
      'Prescription authorization',
      'Patient communication',
    ],
    denied: ['Billing records', 'Hospital administration', 'Audit logs'],
  },
  nurse: {
    allowed: [
      'Patient clinical data (read only)',
      'Prescription (view only)',
      'Administration schedule',
    ],
    denied: [
      'Prescription write / authorization',
      'Full safety dashboard',
      'Billing records',
    ],
  },
  pharmacist: {
    allowed: [
      'Prescription (dispensing view)',
      'Patient name & ID',
      'Safety verification status',
    ],
    denied: [
      'Full clinical notes',
      'Billing records',
      'Safety rule editing',
    ],
  },
  admin: {
    allowed: [
      'Operational metrics dashboard',
      'Billing records',
      'Audit logs',
    ],
    denied: [
      'Patient clinical notes',
      'Prescription write / authorization',
      'Safety editing',
    ],
  },
};

function resourceMatches(pattern: string, resource: string): boolean {
  if (pattern === '*') return true;
  if (pattern.endsWith(':*')) {
    return resource.startsWith(pattern.slice(0, -1));
  }
  return pattern === resource;
}

export class DemoAuthzProvider implements IAuthzProvider {
  readonly providerName = 'demo-cedar-v1';
  readonly isLive = false;

  decide(principal: Principal, action: string, resource: string): PolicyDecision {
    const role = principal.role;

    // Check DENY policies first (explicit deny always wins)
    for (const policy of POLICIES) {
      if (!policy.roles.includes(role)) continue;
      if (policy.effect !== 'DENY') continue;
      if (!policy.actions.includes(action) && !policy.actions.includes('*')) continue;
      if (!policy.resources.some((r) => resourceMatches(r, resource))) continue;

      return {
        decision: 'DENY',
        policyId: policy.policyId,
        reason: `Action "${action}" on resource "${resource}" is explicitly denied for role "${role}" by policy ${policy.policyId}.`,
        providerName: this.providerName,
        isLive: this.isLive,
      };
    }

    // Then check ALLOW policies
    for (const policy of POLICIES) {
      if (!policy.roles.includes(role)) continue;
      if (policy.effect !== 'ALLOW') continue;
      if (!policy.actions.includes(action) && !policy.actions.includes('*')) continue;
      if (!policy.resources.some((r) => resourceMatches(r, resource))) continue;

      return {
        decision: 'ALLOW',
        policyId: policy.policyId,
        reason: `Action "${action}" on resource "${resource}" is permitted for role "${role}" by policy ${policy.policyId}.`,
        providerName: this.providerName,
        isLive: this.isLive,
      };
    }

    // Default deny (no matching ALLOW)
    return {
      decision: 'DENY',
      policyId: 'default-deny',
      reason: `No policy permits action "${action}" on resource "${resource}" for role "${role}". Default deny applied.`,
      providerName: this.providerName,
      isLive: this.isLive,
    };
  }

  listPermissions(principal: Principal): Array<{ action: string; resource: string; effect: 'ALLOW' | 'DENY' }> {
    const { allowed, denied } = ROLE_PERMISSIONS[principal.role];
    const result: Array<{ action: string; resource: string; effect: 'ALLOW' | 'DENY' }> = [];

    for (const item of allowed) {
      result.push({ action: 'access', resource: item, effect: 'ALLOW' });
    }
    for (const item of denied) {
      result.push({ action: 'access', resource: item, effect: 'DENY' });
    }

    return result;
  }
}
