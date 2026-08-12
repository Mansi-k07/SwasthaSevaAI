from pydantic import BaseModel, Field
from typing import Optional


class PredictionRequest(BaseModel):
    district: str
    current_patients: int = Field(..., ge=0)
    occupied_beds: int = Field(..., ge=0)
    total_beds: int = Field(..., ge=1)
    doctors_on_duty: int = Field(..., ge=0)
    monsoon: bool = False
    viral_outbreak: bool = False


class HospitalUpdate(BaseModel):
    current_patients: int = Field(..., ge=0)
    total_beds: int = Field(..., ge=1)
    occupied_beds: int = Field(..., ge=0)
    doctors_on_duty: int = Field(..., ge=0)
    icu_beds: Optional[int] = 0
    icu_occupied: Optional[int] = 0
    emergency_status: Optional[str] = "normal"

