// ============================================================
// ClinicoTrace — AWS Verified Permissions (Cedar) Policies
// 
// These policies define fine-grained access control for 
// clinical resources. They are evaluated by AWS Verified Permissions.
// ============================================================

// ------------------------------------------------------------
// DOCTOR POLICIES
// ------------------------------------------------------------

// Permit doctors to view patients and edit/authorize prescriptions
// within their own department or hospital unit.
permit (
    principal in Role::"Doctor",
    action in [
        Action::"ViewPatient",
        Action::"CreatePrescription",
        Action::"EditPrescription",
        Action::"AuthorizePrescription",
        Action::"AcknowledgeSafetyFinding"
    ],
    resource
)
when {
    principal.department == resource.department ||
    principal.hospitalUnit == resource.hospitalUnit
};

// ------------------------------------------------------------
// NURSE POLICIES
// ------------------------------------------------------------

// Permit nurses to view patient schedules and update administration status
permit (
    principal in Role::"Nurse",
    action in [
        Action::"ViewPatient",
        Action::"ViewMedicationSchedule",
        Action::"UpdateAdministrationStatus"
    ],
    resource
)
when {
    principal.hospitalUnit == resource.hospitalUnit
};

// ------------------------------------------------------------
// PHARMACIST POLICIES
// ------------------------------------------------------------

// Permit pharmacists to view authorized prescriptions and dispense medications
permit (
    principal in Role::"Pharmacist",
    action in [
        Action::"ViewPrescription",
        Action::"DispenseMedication"
    ],
    resource
)
when {
    // Only allow dispensing if the prescription is strictly authorized
    resource.status == "AUTHORIZED" &&
    principal.hospitalUnit == resource.hospitalUnit
};

// Explicitly DENY pharmacists from authorizing or modifying clinical prescriptions
forbid (
    principal in Role::"Pharmacist",
    action in [
        Action::"AuthorizePrescription",
        Action::"EditPrescription",
        Action::"AcknowledgeSafetyFinding"
    ],
    resource
);

// ------------------------------------------------------------
// BILLING POLICIES
// ------------------------------------------------------------

// Permit billing to view diagnostic codes and encounters, but not clinical notes
permit (
    principal in Role::"Billing",
    action in [
        Action::"ViewEncounter",
        Action::"ViewDiagnosisCode",
        Action::"ViewBillingInfo"
    ],
    resource
);

// Explicitly DENY billing any access to raw clinical prescriptions or safety findings
forbid (
    principal in Role::"Billing",
    action in [
        Action::"ViewPrescription",
        Action::"ViewSafetyFinding",
        Action::"CreatePrescription"
    ],
    resource
);
