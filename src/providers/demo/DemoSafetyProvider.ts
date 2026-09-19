// ============================================================
// Demo Safety Provider
// Implements ISafetyProvider using deterministic rule lookup.
// isLive = false — UI MUST display "Demo Mode" badge.
// ============================================================

import type { ISafetyProvider } from '@/providers/interfaces';
import type { Patient, Medication, SafetyEvalResult, SafetyFinding } from '@/types/clinical';
import { findMatchingRules, findConditionRules } from '@/data/clinicalRules';

export class DemoSafetyProvider implements ISafetyProvider {
  readonly providerName = 'demo-rules-v1';
  readonly isLive = false;

  async evaluate(patient: Patient, medications: Medication[]): Promise<SafetyEvalResult> {
    // Simulate brief processing time (realistic for demo)
    await new Promise((r) => setTimeout(r, 800));

    const allMedNames = [
      ...medications.map((m) => m.genericName),
      ...patient.currentMedications.map((m) => m.genericName),
    ];

    const checks: string[] = [
      'Medication identification',
      'Dosage format validation',
      'Duplicate therapy check',
      'Drug-drug interaction check (BNF 86)',
      'Drug-condition interaction check (NFI 2021)',
      'Allergy cross-reference',
    ];

    const findings: SafetyFinding[] = [];
    let findingCounter = 1;

    // DDI rule matching (new medications against all known)
    const ddiRules = findMatchingRules(allMedNames);
    for (const rule of ddiRules) {
      if (rule.ruleType !== 'DDI') continue;

      // Determine which medications are involved (perpetrator from current, object from new)
      const perpetratorTerms = (rule.perpetratorGeneric ?? '').split(',').map((t) => t.trim());
      const objectTerms = (rule.objectGeneric ?? '').split(',').map((t) => t.trim());

      const perpetuatingMed =
        patient.currentMedications.find((m) =>
          perpetratorTerms.some((t) => m.genericName.toLowerCase().includes(t))
        )?.name ?? perpetratorTerms[0];

      const objectMed =
        medications.find((m) =>
          objectTerms.some((t) => m.genericName.toLowerCase().includes(t))
        )?.name ?? objectTerms[0];

      findings.push({
        findingId: `finding-${findingCounter++}`,
        ruleId: rule.ruleId,
        ruleType: rule.ruleType,
        severity: rule.severity,
        medications: [perpetuatingMed, objectMed],
        explanation: rule.explanation,
        source: rule.source,
        sourceVersion: rule.sourceVersion,
        requiredClinicalAction: rule.requiredClinicalAction,
        status: 'active',
        perpetuatingMedication: perpetuatingMed,
        objectMedication: objectMed,
      });
    }

    // DCI rule matching (new medications against patient conditions)
    const newMedNames = medications.map((m) => m.genericName);
    const dciRules = findConditionRules(newMedNames, patient.conditions);
    for (const rule of dciRules) {
      const matchedMed =
        medications.find((m) =>
          rule.matchTerms.some((t) => m.genericName.toLowerCase().includes(t))
        )?.name ?? rule.perpetratorGeneric ?? '';

      findings.push({
        findingId: `finding-${findingCounter++}`,
        ruleId: rule.ruleId,
        ruleType: rule.ruleType,
        severity: rule.severity,
        medications: [matchedMed],
        explanation: rule.explanation,
        source: rule.source,
        sourceVersion: rule.sourceVersion,
        requiredClinicalAction: rule.requiredClinicalAction,
        status: 'active',
        perpetuatingMedication: matchedMed,
      });
    }

    // Allergy check (simple name matching)
    for (const allergy of patient.allergies) {
      const allergyLower = allergy.toLowerCase();
      for (const med of medications) {
        if (
          med.genericName.toLowerCase().includes(allergyLower) ||
          med.name.toLowerCase().includes(allergyLower)
        ) {
          findings.push({
            findingId: `finding-${findingCounter++}`,
            ruleId: 'DAI-LOCAL-ALLERGY-001',
            ruleType: 'DAI',
            severity: 'Critical',
            medications: [med.name],
            explanation: `Patient has a documented allergy to "${allergy}". ${med.name} may be contraindicated.`,
            source: 'Patient Allergy Record',
            sourceVersion: 'Local patient record',
            requiredClinicalAction:
              'Verify allergy history and clinical significance before prescribing. Do not proceed without explicit clinician review.',
            status: 'active',
            objectMedication: med.name,
          });
        }
      }
    }

    const hasCritical = findings.some((f) => f.severity === 'Critical');
    const hasWarning = findings.some((f) => f.severity === 'Moderate' || f.severity === 'Low');

    return {
      status: hasCritical ? 'critical' : hasWarning ? 'warning' : 'clear',
      findings,
      checksPerformed: checks,
      evaluatedAt: new Date().toISOString(),
      providerName: this.providerName,
      isLive: this.isLive,
    };
  }
}
