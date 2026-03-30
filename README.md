# SwasthaSevaAI 🏥

> **AI-Powered Emergency Hospital Monitoring System for India**
> Built for India Innovates 2026 Hackathon

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Netlify-00C7B7?style=flat-square&logo=netlify)](https://poetic-meerkat-ab4a89.netlify.app)
[![Backend API](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=flat-square&logo=render)](https://swasthasevaai-backend-f15e.onrender.com/docs)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)

---

## What is SwasthaSevaAI?

SwasthaSevaAI is a smart hospital emergency monitoring platform that helps **citizens** find available hospitals during emergencies, and helps **hospital administrators** anticipate and prepare for patient surges using AI prediction.

India faces a critical challenge during epidemics, monsoon seasons, and mass casualty events — patients rush to the nearest hospital without knowing if beds are available, causing some hospitals to become dangerously overcrowded while others have capacity. SwasthaSevaAI solves this with real-time monitoring and predictive intelligence.

---

## Features

### For Citizens (Public Dashboard)
- Select hospital by State → District → Hospital
- View real-time bed availability and occupancy
- Run AI prediction to see upcoming patient load
- Get risk level: **LOW** / **MEDIUM** / **HIGH**
- Automatic bed shortage warnings with alternative hospital suggestions
- 7-day patient load forecast chart
- Monsoon and viral outbreak surge detection

### For Hospital Admins
- Secure admin login per hospital
- Submit live data: patients, beds, ICU, doctors on duty
- Data published instantly to public dashboard
- AI prediction shown automatically after each data save
- Live bed occupancy bar updates as you type
- Emergency status: Normal / Alert / Critical

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Charts | Chart.js |
| Backend | Python 3.10+, FastAPI |
| Data Validation | Pydantic v2 |
| Storage (Phase 1) | In-memory (Python dict) |
| Storage (Phase 2) | SQLite → PostgreSQL |
| Frontend Deploy | Netlify |
| Backend Deploy | Render |

---

## Project Structure

```
SwasthaSevaAI/
│
├── backend/
│   ├── main.py            # FastAPI app, all routes, CORS config
│   ├── prediction.py      # AI prediction engine
│   ├── storage.py         # Hospital data store (in-memory)
│   ├── schemas.py         # Pydantic request/response models
│   └── requirements.txt   # Python dependencies (pinned versions)
│
└── frontend/
    ├── index.html         # Public monitoring dashboard
    ├── admin.html         # Hospital admin panel
    ├── style.css          # Design system + all styles
    └── script.js          # All frontend logic
```

---

## Getting Started

### Run the Backend Locally

```bash
# 1. Go into the backend folder
cd backend

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the server
uvicorn main:app --reload
```

The API will be live at `http://localhost:8000`
Interactive API docs at `http://localhost:8000/docs`

### Run the Frontend Locally

Open `frontend/index.html` with VS Code's **Live Server** extension, or any static file server. No build step required.

> **Important:** If running frontend from a file:// URL, the backend CORS already allows it. If using a local server, make sure it runs on `localhost:5500` or update the `allow_origins` list in `main.py`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/docs` | Interactive API documentation |
| `POST` | `/predict` | Run AI prediction for a hospital |
| `POST` | `/hospital/update` | Admin submits hospital resource data |
| `GET` | `/hospitals` | List all hospitals with submitted data |
| `GET` | `/hospital/{name}` | Get a specific hospital's data |
| `GET` | `/hospital/{name}/predict` | Fetch data + run prediction in one call |

### Example: Run a Prediction

```bash
curl -X POST https://swasthasevaai-backend-f15e.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "district": "Patna",
    "current_patients": 180,
    "occupied_beds": 220,
    "total_beds": 300,
    "doctors_on_duty": 14,
    "monsoon": true,
    "viral_outbreak": false
  }'
```

**Response:**
```json
{
  "predicted_patients": 207,
  "beds_required": 124,
  "available_beds": 80,
  "doctors_required": 14,
  "risk_level": "HIGH",
  "bed_shortage": true,
  "beds_short_by": 44,
  "bed_occupancy_percent": 73.3,
  "epidemic_risk": false,
  "message": "Critical alert! Bed capacity critically low. Activate emergency protocols immediately."
}
```

---

## How the AI Prediction Works

The prediction engine in `prediction.py` uses a rule-based model with the following logic:

```
surge_multiplier = 1.10 (base 10% buffer)
  + 0.25 if monsoon season
  + 0.40 if viral outbreak

predicted_patients  = current_patients × surge_multiplier
beds_required       = predicted_patients × 0.60
doctors_required    = predicted_patients ÷ 15
bed_occupancy       = (occupied_beds ÷ total_beds) × 100

Risk Level:
  HIGH   → bed_occupancy > 85% OR doctor_ratio > 20 OR viral_outbreak
  MEDIUM → bed_occupancy > 70% OR doctor_ratio > 12 OR monsoon
  LOW    → everything within safe limits

Epidemic flag → surge_multiplier ≥ 1.60 (60%+ above normal)
```

---

## Admin Login

Default password format for Phase 1: `hospitalname@swastha`

Examples:
- PMCH Patna → `pmchpatna@swastha`
- AIIMS Gorakhpur → `aiimsgorakhpur@swastha`
- KGMU Lucknow → `kgmulucknow@swastha`

> ⚠️ This is a simplified scheme for the hackathon. Phase 2 will implement proper JWT-based authentication with hashed passwords stored in the database.

---

## Deployment

### Frontend (Netlify)
1. Push the `frontend/` folder to GitHub
2. Connect repo to Netlify
3. Set publish directory to `frontend/`
4. Deploy — no build command needed

### Backend (Render)
1. Push the `backend/` folder to GitHub
2. Create a new **Web Service** on Render
3. Set **Build Command:** `pip install -r requirements.txt`
4. Set **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 10000`
5. Set **Root Directory:** `backend`

> **Note:** Render's free tier cold-starts after inactivity (~30 seconds on first request). This is expected — the frontend handles it with a proper error message asking the user to retry.

---

## Known Limitations (Phase 1)

| Limitation | Phase 2 Fix |
|---|---|
| Hospital data lost on server restart | SQLite / PostgreSQL database |
| Simple password scheme | JWT tokens with hashed passwords |
| No historical data | Prediction history table in DB |
| Manual data entry only | Webhook / API integration with HMIS |
| No SMS/email alerts | Twilio / SendGrid integration |

---

## Roadmap

- [x] Phase 1 — Core prediction engine + public dashboard + admin panel
- [ ] Phase 2 — SQLite database + proper auth with JWT
- [ ] Phase 3 — Gemini AI chatbot integration
- [ ] Phase 4 — Multi-state epidemic surge detection
- [ ] Phase 5 — SMS alert system for hospital administrators
- [ ] Phase 6 — Historical data charts + trend analysis

---

## Built By

**Mansi** — Second Year Engineering Student of IIT Patna
**Nikita** — Second Year Engineering Student of IIT Patna
Mentored using SwasthaSevaAI development guidelines

---

## License

This project is open source and available under the [MIT License](LICENSE).
