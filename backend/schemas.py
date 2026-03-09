

from pydantic import BaseModel
   

class PredictionRequest(BaseModel):
    district: str
    current_patients: int
    occupied_beds: int
    total_beds: int
    doctors_on_duty: int
    monsoon: bool = False
    viral_outbreak: bool = False