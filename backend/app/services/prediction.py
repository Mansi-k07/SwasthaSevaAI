

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


    # Bed Required
    beds_required = int(predicted_patients * 0.3)

    bed_occupancy = 0

    if total_beds > 0:
        bed_occupancy = (occupied_beds / total_beds) * 100
       
    if doctors_on_duty > 0:
        doctor_ratio = predicted_patients / doctors_on_duty
    else:
        doctor_ratio = predicted_patients
    

    # Risk Level Logic
    if bed_occupancy > 85 or doctor_ratio > 15 or viral_outbreak:
        risk_level = "RED"
    elif bed_occupancy > 70 or doctor_ratio > 10:
        risk_level = "YELLOW"
    else:
        risk_level = "GREEN"


    # Message
    if risk_level == "GREEN":
        message = "Situation under control."
    elif risk_level == "YELLOW":
        message = "Prepare additional staff and beds."
    else:
        message = "High alert! Increase emergency capacity immediately."

    return {
        "predicted_patients": predicted_patients,
        "risk_level": risk_level,
        "beds_required": beds_required,
        "message": message
    }