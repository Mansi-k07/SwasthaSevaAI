def predict_hospital_status(
    current_patients: int,
    occupied_beds: int,
    total_beds: int,
    doctors_on_duty: int,
    monsoon: bool = False,
    viral_outbreak: bool = False
) -> dict:
    """
    AI Prediction Engine for SwasthaSevaAI.

    Calculates predicted patient load, bed requirements, doctor needs,
    and risk level based on current hospital data and environmental factors.

    Returns a dict with all prediction results.
    """

    # --- SURGE CALCULATION ---
    # Base: every hospital has a natural 10% daily variation buffer
    surge_multiplier = 1.10

    if monsoon:
        # Monsoon increases water-borne diseases, accidents, flooding injuries
        surge_multiplier += 0.25

    if viral_outbreak:
        # Viral outbreaks cause significant patient surge
        surge_multiplier += 0.40

    predicted_patients = int(current_patients * surge_multiplier)

    # --- BED REQUIREMENT ---
    # Approximately 60% of predicted patients need inpatient admission
    # (remaining are OPD / walk-in / treated and released)
    beds_required = int(predicted_patients * 0.60)

    available_beds = max(0, total_beds - occupied_beds)

    # Bed occupancy as percentage (how full the hospital currently is)
    if total_beds > 0:
        bed_occupancy_pct = round((occupied_beds / total_beds) * 100, 1)
    else:
        bed_occupancy_pct = 100.0

    # --- DOCTOR WORKLOAD ---
    # Standard emergency ratio: 1 doctor per 15 patients
    if doctors_on_duty > 0:
        doctor_ratio = round(predicted_patients / doctors_on_duty, 1)
    else:
        doctor_ratio = 999.0  # no doctors = maximum stress

    doctors_required = max(1, int(predicted_patients / 15))

    # --- RISK LEVEL ---
    # BUG FIXED: original code used GREEN/YELLOW/RED here
    # but script.js checked for LOW/MEDIUM/HIGH — badges never worked.
    # Now both backend and frontend use: LOW / MEDIUM / HIGH
    if bed_occupancy_pct > 85 or doctor_ratio > 20 or viral_outbreak:
        risk_level = "HIGH"
        message = "Critical alert! Bed capacity critically low. Activate emergency protocols immediately."
    elif bed_occupancy_pct > 70 or doctor_ratio > 12 or monsoon:
        risk_level = "MEDIUM"
        message = "Moderate risk. Prepare additional staff and reserve extra beds."
    else:
        risk_level = "LOW"
        message = "Situation is under control. Continue routine monitoring."

    # --- BED SHORTAGE ---
    bed_shortage = available_beds < beds_required
    beds_short_by = max(0, beds_required - available_beds)

    # --- EPIDEMIC SURGE DETECTION ---
    # A simple heuristic: if surge is 50%+ above current capacity, flag it
    epidemic_risk = surge_multiplier >= 1.60

    return {
        "predicted_patients": predicted_patients,
        "beds_required": beds_required,
        "available_beds": available_beds,
        "doctors_required": doctors_required,
        "risk_level": risk_level,            # "LOW" | "MEDIUM" | "HIGH"
        "bed_shortage": bed_shortage,
        "beds_short_by": beds_short_by,
        "bed_occupancy_percent": bed_occupancy_pct,
        "doctor_ratio": doctor_ratio,        # patients per doctor
        "epidemic_risk": epidemic_risk,
        "message": message,
        "surge_multiplier": round(surge_multiplier, 2)
    }
