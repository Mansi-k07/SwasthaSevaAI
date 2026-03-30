from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# BUG FIXED: removed "backend." prefix from imports.
# Original: from backend.schemas / from backend.prediction
# Crashed on Render with ModuleNotFoundError because the working
# directory is already /backend — no sub-package prefix needed.
from backend.schemas import PredictionRequest, HospitalUpdate
from prediction import predict_hospital_status
from storage import (
    update_hospital_data,
    get_hospital_data,
    get_all_hospitals,
)

app = FastAPI(
    title="SwasthaSevaAI API",
    description="AI-Powered Emergency Hospital Monitoring System for India",
    version="2.0.0"
)

# BUG FIXED: CORS configuration.
# Original had allow_origins=["*"] WITH allow_credentials=True.
# This combination is INVALID — browsers reject it.
# Rule: either use ["*"] with no credentials, or list exact origins.
# We list exact origins so credentials can work.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://poetic-meerkat-ab4a89.netlify.app",   # your live Netlify site
        "http://localhost:5500",                         # VS Code Live Server
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "null",                                          # file:// origin for local testing
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# HEALTH CHECK
# ──────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "SwasthaSevaAI Backend is running",
        "version": "2.0.0",
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}


# ──────────────────────────────────────────────
# AI PREDICTION ENDPOINT
# ──────────────────────────────────────────────

@app.post("/predict", tags=["AI Prediction"])
def predict(data: PredictionRequest):
    """
    Run AI prediction for a hospital.
    Accepts current hospital stats + environmental flags.
    Returns predicted patient load, bed needs, risk level, and alerts.
    """
    result = predict_hospital_status(
        current_patients=data.current_patients,
        occupied_beds=data.occupied_beds,
        total_beds=data.total_beds,
        doctors_on_duty=data.doctors_on_duty,
        monsoon=data.monsoon,
        viral_outbreak=data.viral_outbreak,
    )
    return result


# ──────────────────────────────────────────────
# HOSPITAL DATA ENDPOINTS
# ──────────────────────────────────────────────

@app.post("/hospital/update", tags=["Hospital Data"])
def update_hospital(hospital_name: str, data: HospitalUpdate):
    """
    Hospital admin submits current resource data.
    Saves it so the public dashboard can read it.
    This fixes the core architectural bug where data only lived in
    one browser's localStorage and citizens could never see it.
    """
    if data.occupied_beds > data.total_beds:
        raise HTTPException(
            status_code=400,
            detail="occupied_beds cannot exceed total_beds"
        )

    saved = update_hospital_data(hospital_name, data.model_dump())
    return {
        "message": "Hospital data updated successfully",
        "hospital": hospital_name,
        "data": saved
    }


@app.get("/hospitals", tags=["Hospital Data"])
def list_all_hospitals():
    """
    Returns all hospitals that have submitted data.
    Used by the public dashboard to show network-wide status.
    """
    all_data = get_all_hospitals()
    return {
        "count": len(all_data),
        "hospitals": all_data
    }


@app.get("/hospital/{hospital_name}", tags=["Hospital Data"])
def get_hospital(hospital_name: str):
    """
    Get a specific hospital's current resource data.
    Called by the public dashboard before running prediction.
    """
    data = get_hospital_data(hospital_name)
    if data is None:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for '{hospital_name}'. The admin must submit data first."
        )
    return data


@app.get("/hospital/{hospital_name}/predict", tags=["AI Prediction"])
def predict_for_hospital(
    hospital_name: str,
    monsoon: bool = False,
    viral_outbreak: bool = False
):
    """
    Convenience endpoint: fetch hospital data + run prediction in one call.
    """
    data = get_hospital_data(hospital_name)
    if data is None:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for '{hospital_name}'. The admin must submit data first."
        )

    result = predict_hospital_status(
        current_patients=data["current_patients"],
        occupied_beds=data["occupied_beds"],
        total_beds=data["total_beds"],
        doctors_on_duty=data["doctors_on_duty"],
        monsoon=monsoon,
        viral_outbreak=viral_outbreak,
    )
    return {
        "hospital": hospital_name,
        "current_data": data,
        "prediction": result
    }
