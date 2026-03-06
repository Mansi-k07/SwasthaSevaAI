

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import PredictionRequest
from app.services.prediction import predict_hospital_status

app = FastAPI(title = "SwasthaSevaAI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def home():
    return "SwasthaSevaAI Backend Running"

@app.post("/predict")
def predict(data: PredictionRequest):
    
    result = predict_hospital_status(
        current_patients = data.current_patients,
        occupied_beds = data.occupied_beds,
        total_beds = data.total_beds,
        doctors_on_duty = data.doctors_on_duty,
        monsoon = data.monsoon,
        viral_outbreak = data.viral_outbreak
    )

    return {
        "district": data.district,
        **result
    }