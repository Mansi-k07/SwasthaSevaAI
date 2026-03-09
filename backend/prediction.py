
def predict_hospital_status(
    current_patients: int,
    occupied_beds: int,
    total_beds: int,
    doctors_on_duty: int,
    monsoon: bool = False,
    viral_outbreak: bool = False
):

    surge = 0

    # Surge calculation
    if monsoon:
        surge += 0.20

    if viral_outbreak:
        surge += 0.30

    predicted_patients = int(current_patients * (1 + surge))

    # Beds required
    beds_required = int(predicted_patients * 0.3)

    # Available beds
    available_beds = total_beds - occupied_beds

    # Bed occupancy percentage
    if total_beds > 0:
        bed_occupancy = (occupied_beds / total_beds) * 100
    else:
        bed_occupancy = 0

    # Doctor workload
    if doctors_on_duty > 0:
        doctor_ratio = predicted_patients / doctors_on_duty
    else:
        doctor_ratio = predicted_patients

    # Doctors required
    doctors_required = int(predicted_patients / 15)

    # Risk Level
    if bed_occupancy > 85 or doctor_ratio > 15 or viral_outbreak:
        risk_level = "RED"
    elif bed_occupancy > 70 or doctor_ratio > 10:
        risk_level = "YELLOW"
    else:
        risk_level = "GREEN"

    # Bed shortage check
    bed_shortage = available_beds < beds_required

    # Alert message
    if risk_level == "GREEN":
        message = "Situation under control."
    elif risk_level == "YELLOW":
        message = "Prepare additional staff and beds."
    else:
        message = "High alert! Increase emergency capacity immediately."

    return {
        "predicted_patients": predicted_patients,
        "beds_required": beds_required,
        "available_beds": available_beds,
        "doctors_required": doctors_required,
        "risk_level": risk_level,
        "bed_shortage": bed_shortage,
        "message": message
    }