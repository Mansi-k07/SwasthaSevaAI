let chart;

// ------------------------
// DROPDOWN DATA
// ------------------------

const hospitalData = {

"Bihar": {
"Patna": [
"Patna Medical College and Hospital (PMCH)",
"Indira Gandhi Institute of Medical Sciences (IGIMS)",
"AIIMS Patna"
]
},

"Uttar Pradesh": {
"Lucknow": [
"KGMU",
"SGPGIMS"
]
},

"Jharkhand": {
"Ranchi": [
"RIMS",
"CIP"
]
}

};

// ------------------------
// DROPDOWN LOGIC
// ------------------------

function updateDistricts(){

let state = document.getElementById("state").value;
let districtSelect = document.getElementById("district");

districtSelect.innerHTML = "<option value=''>Select District</option>";

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
// FORECAST
// ------------------------

function generateDummyForecast(baseLoad){

let forecast = [];

for(let i=0;i<7;i++){
forecast.push(baseLoad + Math.floor(Math.random()*20-10));
}

return forecast;

}

// ------------------------
// MAIN PREDICT FUNCTION
// ------------------------

async function predict(){

let district = document.getElementById("district").value;
let hospital = document.getElementById("hospital").value;

let monsoon = document.getElementById("monsoon").checked;
let outbreak = document.getElementById("outbreak").checked;

let storedData = localStorage.getItem("hospitalLiveData");

if(!storedData){
alert("Admin data not found. Please enter hospital data first.");
return;
}

let parsed = JSON.parse(storedData);

let availableBeds = parsed.total_beds - parsed.occupied_beds;
document.getElementById("availableBeds").innerText = availableBeds;

let payload = {
district: district,
current_patients: parsed.current_patients,
occupied_beds: parsed.occupied_beds,
total_beds: parsed.total_beds,
doctors_on_duty: parsed.doctors_on_duty,
monsoon: monsoon,
viral_outbreak: outbreak
};

try{

let response = await fetch("http://127.0.0.1:8000/predict",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(payload)
});

let data = await response.json();

document.getElementById("load").innerText = data.predicted_patients;
document.getElementById("beds").innerText = data.beds_required;
document.getElementById("risk").innerText = data.risk_level;

let doctorsNeeded = Math.ceil(data.predicted_patients / 15);
document.getElementById("doctors").innerText = doctorsNeeded;


// ------------------------
// SUGGESTION LOGIC
// ------------------------

let suggestionBox = document.getElementById("suggestionBox");
let suggestionText = document.getElementById("suggestionText");

if(availableBeds < data.beds_required){

suggestionBox.style.display = "block";

if(hospital.includes("PMCH")){
suggestionText.innerText =
"⚠ PMCH bed shortage expected. Suggested hospital: IGIMS.";
}
else if(hospital.includes("IGIMS")){
suggestionText.innerText =
"⚠ IGIMS capacity low. Suggested hospital: AIIMS Patna.";
}
else{
suggestionText.innerText =
"⚠ Bed shortage expected. Redirect patients to nearest hospital.";
}

}
else{

suggestionBox.style.display = "block";
suggestionText.innerText = "✅ Beds sufficient in selected hospital.";

}


// ------------------------
// CHART
// ------------------------

let forecast = generateDummyForecast(data.predicted_patients);

if(chart) chart.destroy();

chart = new Chart(document.getElementById("forecastChart"),{

type:'line',

data:{
labels:["Day1","Day2","Day3","Day4","Day5","Day6","Day7"],
datasets:[{
label:"7-Day Patient Forecast",
data:forecast,
borderColor:"blue",
fill:false
}]
}

});

}
catch(error){

alert("Backend connection failed");

}

}