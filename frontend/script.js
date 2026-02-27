let chart;

// ------------------------
// FULL STATE → DISTRICT → HOSPITAL DATA
// ------------------------

const hospitalData = {

    "Bihar": {
        "Patna": [
            "Patna Medical College and Hospital (PMCH)",
            "Indira Gandhi Institute of Medical Sciences (IGIMS)",
            "AIIMS Patna"
        ],
        "Gaya": [
            "ANMMCH",
            "JPN Hospital Gaya",
            "I.D Hospital Gaya"
        ],
        "Muzaffarpur": [
            "SKMCH",
            "Sadar Hospital Muzaffarpur",
            "Homi Bhabha Cancer Hospital"
        ]
    },

    "Uttar Pradesh": {
        "Lucknow": [
            "KGMU",
            "SGPGIMS",
            "Balrampur Hospital"
        ],
        "Gorakhpur": [
            "AIIMS Gorakhpur",
            "Netaji Subhash District Hospital",
            "District Women Hospital"
        ],
        "Varanasi": [
            "Lal Bahadur Shastri Hospital",
            "Pandit Deen Dayal Hospital"
        ]
    },

    "Jharkhand": {
        "Ranchi": [
            "RIMS",
            "CIP",
            "RINPAS"
        ],
        "Dhanbad": [
            "Central Hospital",
            "Sadar Hospital",
            "Divisional Hospital"
        ],
        "Jamshedpur": [
            "MGM Medical College",
            "Sadar Hospital",
            "Tata Main Hospital"
        ]
    }

};


// ------------------------
// Dropdown Logic
// ------------------------

function updateDistricts(){

    let state = document.getElementById("state").value;
    let districtSelect = document.getElementById("district");
    let hospitalSelect = document.getElementById("hospital");

    districtSelect.innerHTML = "<option value=''>Select District</option>";
    hospitalSelect.innerHTML = "<option value=''>Select Hospital</option>";

    if(hospitalData[state]){
        Object.keys(hospitalData[state]).forEach(district=>{
            districtSelect.innerHTML += `<option value="${district}">${district}</option>`;
        });
    }
}

function updateHospitals(){

    let state = document.getElementById("state").value;
    let district = document.getElementById("district").value;
    let hospitalSelect = document.getElementById("hospital");

    hospitalSelect.innerHTML = "<option value=''>Select Hospital</option>";

    if(hospitalData[state] && hospitalData[state][district]){
        hospitalData[state][district].forEach(hospital=>{
            hospitalSelect.innerHTML += `<option value="${hospital}">${hospital}</option>`;
        });
    }
}


// ------------------------
// Forecast Generator
// ------------------------

function generateDummyForecast(baseLoad) {
    let forecast = [];
    for(let i = 0; i < 7; i++){
        forecast.push(baseLoad + Math.floor(Math.random()*20 - 10));
    }
    return forecast;
}


// ------------------------
// Risk + Doctor Logic
// ------------------------

function calculateRisk(load){

    let doctorsNeeded = Math.ceil(load / 15);

    if(load < 150) 
        return {level:"Low", class:"low", doctors: doctorsNeeded};

    if(load < 220) 
        return {level:"Medium", class:"medium", doctors: doctorsNeeded};

    return {level:"High", class:"high", doctors: doctorsNeeded};
}


// ------------------------
// MAIN PREDICT FUNCTION
// ------------------------

function predict(){

    let district = document.getElementById("district").value;
    let hospital = document.getElementById("hospital").value;
    let monsoon = document.getElementById("monsoon").checked;
    let outbreak = document.getElementById("outbreak").checked;

    let baseLoad = 100;

    // District base load
    if(district === "Patna") baseLoad = 140;
    if(district === "Gaya") baseLoad = 110;
    if(district === "Muzaffarpur") baseLoad = 125;
    if(district === "Lucknow") baseLoad = 150;
    if(district === "Ranchi") baseLoad = 135;

    // Hospital-wise dynamic load
    if(hospital.includes("PMCH")) baseLoad = 180;
    if(hospital.includes("IGIMS")) baseLoad = 130;
    if(hospital.includes("AIIMS")) baseLoad = 110;
    if(hospital.includes("KGMU")) baseLoad = 160;
    if(hospital.includes("RIMS")) baseLoad = 150;

    // Surge calculation
    let surge = 0;
    if(monsoon) surge += baseLoad * 0.2;
    if(outbreak) surge += baseLoad * 0.3;

    // AI logic concept:
    // Predicted = CurrentPatients + Surge

    let predictedLoad = Math.floor(baseLoad + surge);

    document.getElementById("load").innerText = predictedLoad;

    // Risk
    let riskData = calculateRisk(predictedLoad);

    let riskElement = document.getElementById("risk");
    riskElement.innerText = riskData.level;
    riskElement.className = "risk " + riskData.class;

    document.getElementById("doctors").innerText = riskData.doctors;

    let bedsRequired = Math.floor(predictedLoad * 0.3);
    document.getElementById("beds").innerText = bedsRequired;

    // Alert & Color
    let loadElement = document.getElementById("load");
    let doctorElement = document.getElementById("doctors");
    let bedsElement = document.getElementById("beds");

    if(riskData.level === "High"){
        loadElement.style.color = "#c62828";
        doctorElement.style.color = "#c62828";
        bedsElement.style.color = "#c62828";
        document.getElementById("alertMessage").style.display = "block";
    }
    else if(riskData.level === "Medium"){
        loadElement.style.color = "#f9a825";
        doctorElement.style.color = "#f9a825";
        bedsElement.style.color = "#f9a825";
        document.getElementById("alertMessage").style.display = "none";
    }
    else{
        loadElement.style.color = "#2e7d32";
        doctorElement.style.color = "#2e7d32";
        bedsElement.style.color = "#2e7d32";
        document.getElementById("alertMessage").style.display = "none";
    }

    // Suggestion logic
    let suggestionBox = document.getElementById("suggestionBox");
    let suggestionText = document.getElementById("suggestionText");

    if(riskData.level === "High"){
        suggestionText.innerText = "Redirect patients to alternative hospital within district.";
        suggestionBox.style.display = "block";
    } else {
        suggestionBox.style.display = "none";
    }

    // Chart
    let forecast = generateDummyForecast(predictedLoad);

    if(chart) chart.destroy();

    chart = new Chart(document.getElementById("forecastChart"), {
        type: 'line',
        data: {
            labels: ["Day1","Day2","Day3","Day4","Day5","Day6","Day7"],
            datasets: [{
                label: "7-Day Emergency Forecast",
                data: forecast,
                borderColor: "blue",
                fill: false
            }]
        }
    });
}