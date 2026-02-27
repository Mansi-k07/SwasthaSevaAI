def predict_hospital_status(
    current_patients,
    occupied_beds,
    total_beds,
    doctors_on_duty,
    monsoon=False,
    viral=False
):

    surge = 0

    if monsoon:
        surge += current_patients * 0.2

    if viral:
        surge += current_patients * 0.3

    predicted = int(current_patients + surge)

    beds_required = int(predicted * 0.3)

    bed_occupancy = 0
    if total_beds > 0:
        bed_occupancy = (occupied_beds / total_beds) * 100

    doctor_ratio = predicted / doctors_on_duty if doctors_on_duty > 0 else predicted

    risk = "GREEN"

    if bed_occupancy > 85 or doctor_ratio > 15 or viral:
        risk = "RED"
    elif bed_occupancy > 70 or doctor_ratio > 10:
        risk = "YELLOW"

    return {
        "predicted": predicted,
        "beds_required": beds_required,
        "risk": risk
    }