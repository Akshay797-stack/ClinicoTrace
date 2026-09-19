// ============================================================
// ClinicoTrace — Clinical Rule Repository
// Source-verified drug safety rules for the deterministic engine
//
// IMPORTANT: These rules are sourced from the references listed
// on each rule. They are provided for DEMONSTRATION purposes only.
// This is NOT a substitute for a certified clinical decision support
// system. All clinical decisions remain with the licensed clinician.
//
// NFI 2021 (National Formulary of India, 2021) is used only as a
// formulary reference for Indian market drug names and dosage norms.
// It is NOT used as a DDI source.
// ============================================================

import type { ClinicalRule } from '@/types/clinical';

export const CLINICAL_RULES: ClinicalRule[] = [
  // ----------------------------------------------------------
  // DDI-BNF86-BETABLOCK-BETA2AG-001
  // Beta-blockers + Beta-2 agonists (e.g. Atenolol + Salbutamol)
  // ----------------------------------------------------------
  {
    ruleId: 'DDI-BNF86-BETABLOCK-BETA2AG-001',
    ruleType: 'DDI',
    severity: 'Moderate',
    perpetratorDrug: 'Beta-adrenoceptor blockers',
    perpetratorGeneric: 'atenolol, metoprolol, propranolol, bisoprolol, carvedilol',
    objectDrug: 'Beta-2 adrenoceptor agonists',
    objectGeneric: 'salbutamol, formoterol, salmeterol, terbutaline',
    explanation:
      'Beta-adrenoceptor blockers (including cardioselective agents such as Atenolol) ' +
      'can antagonize the bronchodilatory effect of beta-2 adrenoceptor agonists such as Salbutamol. ' +
      'In patients with reactive airways disease (asthma, COPD), concurrent use may reduce the ' +
      'efficacy of the bronchodilator and risk bronchospasm exacerbation. Cardioselective ' +
      'beta-blockers carry lower but not absent risk compared to non-selective agents.',
    source: 'British National Formulary (BNF)',
    sourceVersion: 'BNF 86, September 2023',
    sourceUrl: 'https://bnf.nice.org.uk/interaction/atenolol-2/',
    nfiReference: 'NFI 2021, Section 12.3 — Bronchodilators (dosage and formulary context only)',
    requiredClinicalAction:
      'Prescribing clinician must review: ' +
      '(1) Whether Atenolol or other beta-blocker can be substituted with an alternative ' +
      'antihypertensive class (e.g. ACE inhibitor, calcium channel blocker, ARB) that does not ' +
      'antagonize bronchodilator therapy. ' +
      '(2) Whether the clinical benefit of Salbutamol therapy outweighs the interaction risk ' +
      'given the degree of beta-1 selectivity and the patient\'s airway reactivity. ' +
      '(3) Clinical decision and rationale must be documented in the patient record. ' +
      'ClinicoTrace does NOT auto-modify or withhold the prescription.',
    matchTerms: [
      'atenolol', 'metoprolol', 'propranolol', 'bisoprolol', 'carvedilol',
      'salbutamol', 'formoterol', 'salmeterol', 'terbutaline',
    ],
  },

  // ----------------------------------------------------------
  // DDI-BNF86-MACROLIDE-STATINS-001
  // Clarithromycin / Erythromycin + Statins (CYP3A4 inhibition)
  // ----------------------------------------------------------
  {
    ruleId: 'DDI-BNF86-MACROLIDE-STATINS-001',
    ruleType: 'DDI',
    severity: 'Moderate',
    perpetratorDrug: 'Macrolide antibiotics (CYP3A4 inhibitors)',
    perpetratorGeneric: 'clarithromycin, erythromycin',
    objectDrug: 'HMG-CoA reductase inhibitors (Statins)',
    objectGeneric: 'atorvastatin, simvastatin, lovastatin',
    explanation:
      'Clarithromycin and erythromycin are potent inhibitors of CYP3A4. ' +
      'Co-administration with statins metabolized by CYP3A4 (atorvastatin, simvastatin, lovastatin) ' +
      'can substantially raise statin plasma concentrations, increasing the risk of ' +
      'myopathy and rhabdomyolysis. Pravastatin and rosuvastatin are less affected as ' +
      'they are not primarily metabolized by CYP3A4.',
    source: 'British National Formulary (BNF)',
    sourceVersion: 'BNF 86, September 2023',
    sourceUrl: 'https://bnf.nice.org.uk/interaction/clarithromycin-2/',
    nfiReference: 'NFI 2021, Section 7.1 — Lipid-regulating drugs (formulary context only)',
    requiredClinicalAction:
      'Clinician to review: (1) Temporarily withhold statin during the macrolide course if feasible. ' +
      '(2) Consider switching to azithromycin (less CYP3A4 inhibition) if the clinical indication permits. ' +
      '(3) If co-administration is necessary, use the lowest effective statin dose and counsel the patient ' +
      'to report muscle pain, tenderness, or weakness immediately. Document decision.',
    matchTerms: [
      'clarithromycin', 'erythromycin',
      'atorvastatin', 'simvastatin', 'lovastatin',
    ],
  },

  // ----------------------------------------------------------
  // DDI-BNF86-WARFARIN-NSAID-001
  // Warfarin + NSAIDs (bleeding risk)
  // ----------------------------------------------------------
  {
    ruleId: 'DDI-BNF86-WARFARIN-NSAID-001',
    ruleType: 'DDI',
    severity: 'Critical',
    perpetratorDrug: 'Vitamin K antagonists',
    perpetratorGeneric: 'warfarin, acenocoumarol',
    objectDrug: 'Non-steroidal anti-inflammatory drugs (NSAIDs)',
    objectGeneric: 'ibuprofen, diclofenac, naproxen, ketoprofen, aspirin',
    explanation:
      'NSAIDs inhibit platelet aggregation and can cause gastrointestinal mucosal damage, ' +
      'significantly increasing the risk of bleeding in patients receiving anticoagulants ' +
      'such as warfarin. Aspirin at analgesic doses additionally displaces warfarin from ' +
      'plasma protein binding sites and may inhibit CYP2C9 metabolism, elevating the INR.',
    source: 'British National Formulary (BNF)',
    sourceVersion: 'BNF 86, September 2023',
    nfiReference: undefined,
    requiredClinicalAction:
      'Avoid concurrent use unless the clinical benefit clearly outweighs the risk. ' +
      'If NSAID analgesia is necessary, consider using paracetamol as an alternative. ' +
      'If co-administration is unavoidable, arrange enhanced INR monitoring, gastroprotection ' +
      '(PPI), and patient counselling on bleeding signs. Document clinical rationale.',
    matchTerms: [
      'warfarin', 'acenocoumarol',
      'ibuprofen', 'diclofenac', 'naproxen', 'ketoprofen',
    ],
  },

  // ----------------------------------------------------------
  // DDI-BNF86-ACEI-K-SPARING-001
  // ACE inhibitors + Potassium-sparing diuretics (hyperkalemia)
  // ----------------------------------------------------------
  {
    ruleId: 'DDI-BNF86-ACEI-K-SPARING-001',
    ruleType: 'DDI',
    severity: 'Moderate',
    perpetratorDrug: 'ACE inhibitors / ARBs',
    perpetratorGeneric: 'ramipril, enalapril, lisinopril, losartan, valsartan, telmisartan',
    objectDrug: 'Potassium-sparing diuretics / aldosterone antagonists',
    objectGeneric: 'spironolactone, eplerenone, amiloride',
    explanation:
      'Both ACE inhibitors/ARBs and potassium-sparing diuretics reduce renal potassium excretion ' +
      'through complementary mechanisms. Combination therapy significantly increases the risk of ' +
      'hyperkalaemia, which can cause life-threatening cardiac arrhythmias. Risk is amplified ' +
      'in patients with chronic kidney disease or those taking NSAIDs concurrently.',
    source: 'British National Formulary (BNF)',
    sourceVersion: 'BNF 86, September 2023',
    requiredClinicalAction:
      'If combination is clinically indicated (e.g. heart failure with specialist supervision), ' +
      'monitor serum potassium and renal function at baseline and periodically thereafter. ' +
      'Start at low doses and titrate cautiously. Advise patient to avoid potassium supplements ' +
      'and high-potassium foods. Document clinical rationale.',
    matchTerms: [
      'ramipril', 'enalapril', 'lisinopril', 'losartan', 'valsartan', 'telmisartan',
      'spironolactone', 'eplerenone', 'amiloride',
    ],
  },

  // ----------------------------------------------------------
  // DCI-NFI2021-METFORMIN-RENAL-001
  // Metformin — Dose caution in impaired renal function
  // Source: NFI 2021 (used here as a formulary/prescribing guidance source, not DDI)
  // ----------------------------------------------------------
  {
    ruleId: 'DCI-NFI2021-METFORMIN-RENAL-001',
    ruleType: 'DCI',
    severity: 'Moderate',
    perpetratorDrug: 'Biguanides',
    perpetratorGeneric: 'metformin',
    condition: 'Chronic Kidney Disease (CKD) / Renal Impairment',
    explanation:
      'Metformin is renally excreted and can accumulate in patients with impaired renal function, ' +
      'increasing the risk of lactic acidosis — a rare but serious complication. ' +
      'Prescribing guidance advises dose review when eGFR falls below 45 mL/min/1.73m², ' +
      'and discontinuation is recommended when eGFR falls below 30.',
    source: 'National Formulary of India (NFI)',
    sourceVersion: 'NFI 2021, 1st Edition',
    nfiReference: 'NFI 2021, Section 6.1.2 — Biguanides: Prescribing in Renal Impairment',
    requiredClinicalAction:
      'Check patient\'s most recent eGFR before prescribing or continuing metformin. ' +
      'Review dose if eGFR is 30–45; withhold if eGFR < 30. ' +
      'Advise patient to temporarily discontinue before iodinated contrast procedures.',
    matchTerms: ['metformin'],
  },
];

// ---- Rule lookup helpers -----------------------------------

/**
 * Given a list of medication names (lowercase), find all matching rules.
 * Matches if ANY matchTerm appears in ANY medication name.
 */
export function findMatchingRules(medicationNames: string[]): ClinicalRule[] {
  const normalised = medicationNames.map((n) => n.toLowerCase().trim());
  const matched: ClinicalRule[] = [];
  const seenRuleIds = new Set<string>();

  for (const rule of CLINICAL_RULES) {
    if (seenRuleIds.has(rule.ruleId)) continue;

    const ruleMatches = rule.matchTerms.filter((term) =>
      normalised.some((name) => name.includes(term) || term.includes(name))
    );

    // For DDI rules: need ≥2 match terms from the rule's perpetrator/object sides
    if (rule.ruleType === 'DDI') {
      const perpetratorTerms = (rule.perpetratorGeneric ?? '').split(',').map((t) => t.trim());
      const objectTerms = (rule.objectGeneric ?? '').split(',').map((t) => t.trim());

      const perpetratorHit = normalised.some((name) =>
        perpetratorTerms.some((term) => name.includes(term) || term.includes(name))
      );
      const objectHit = normalised.some((name) =>
        objectTerms.some((term) => name.includes(term) || term.includes(name))
      );

      if (perpetratorHit && objectHit) {
        matched.push(rule);
        seenRuleIds.add(rule.ruleId);
      }
    } else if (ruleMatches.length > 0) {
      // For DCI, DAI, etc.: any match is sufficient
      matched.push(rule);
      seenRuleIds.add(rule.ruleId);
    }
  }

  return matched;
}

/**
 * For DCI rules: also match against patient conditions
 */
export function findConditionRules(
  medicationNames: string[],
  conditions: string[]
): ClinicalRule[] {
  const normMeds = medicationNames.map((n) => n.toLowerCase().trim());
  const normConditions = conditions.map((c) => c.toLowerCase().trim());
  const matched: ClinicalRule[] = [];

  for (const rule of CLINICAL_RULES) {
    if (rule.ruleType !== 'DCI') continue;
    if (!rule.condition) continue;

    const ruleCondition = rule.condition.toLowerCase();
    const conditionHit = normConditions.some(
      (c) => c.includes(ruleCondition) || ruleCondition.includes(c)
    );
    const medHit = normMeds.some((name) =>
      rule.matchTerms.some((term) => name.includes(term) || term.includes(name))
    );

    if (conditionHit && medHit) {
      matched.push(rule);
    }
  }

  return matched;
}
