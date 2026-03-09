let chart;


// =========================
// HOSPITAL NETWORK
// =========================

const hospitalData = {

"Bihar":{

"Patna":[
"PMCH",
"IGIMS",
"AIIMS Patna"
],

"Gaya":[
"ANMMCH",
"JPN Hospital",
"ID Hospital"
],

"Muzaffarpur":[
"SKMCH",
"Sadar Hospital Muzaffarpur",
"Homi Bhabha Cancer Hospital"
]

},

"Uttar Pradesh":{

"Lucknow":[
"KGMU",
"SGPGIMS",
"Balrampur Hospital"
],

"Gorakhpur":[
"AIIMS Gorakhpur",
"NSCBD Hospital",
"District Women Hospital"
],

"Varanasi":[
"Lal Bahadur Shastri Hospital",
"Pandit Deen Dayal Hospital"
]

},

"Jharkhand":{

"Ranchi":[
"RIMS",
"CIP",
"RINPAS"
],

"Dhanbad":[
"Central Hospital",
"Sadar Hospital",
"Divisional Hospital"
],

"Jamshedpur":[
"MGM Medical College",
"Sadar Hospital Jamshedpur",
"Tata Main Hospital"
]

}

}


// =========================
// ADMIN LOGIN HOSPITAL LIST
// =========================

function loadHospitalLoginList(){

let select = document.getElementById("adminHospital")

if(!select) return

select.innerHTML = '<option value="">Select Hospital</option>'

Object.keys(hospitalData).forEach(state=>{

Object.keys(hospitalData[state]).forEach(district=>{

hospitalData[state][district].forEach(hospital=>{

let option = document.createElement("option")
option.value = hospital
option.text = hospital

select.appendChild(option)

})

})

})

}

window.onload = loadHospitalLoginList



// =========================
// DROPDOWN
// =========================

function updateDistricts(){

let state=document.getElementById("state").value
let districtSelect=document.getElementById("district")

districtSelect.innerHTML="<option>Select District</option>"

if(!hospitalData[state]) return

Object.keys(hospitalData[state]).forEach(d=>{

districtSelect.innerHTML+=`<option value="${d}">${d}</option>`

})

}



function updateHospitals(){

let state=document.getElementById("state").value
let district=document.getElementById("district").value

let hospitalSelect=document.getElementById("hospital")

hospitalSelect.innerHTML="<option>Select Hospital</option>"

if(!hospitalData[state] || !hospitalData[state][district]) return

hospitalData[state][district].forEach(h=>{

hospitalSelect.innerHTML+=`<option value="${h}">${h}</option>`

})

}



// =========================
// ADMIN LOGIN
// =========================

function openAdminLogin(){
document.getElementById("adminLoginModal").style.display="block"
}

function closeAdminLogin(){
document.getElementById("adminLoginModal").style.display="none"
}



function loginAdmin(){

let hospital = document.getElementById("adminHospital").value
let password = document.getElementById("adminPassword").value

if(!hospital){
alert("Select hospital first")
return
}

let expectedPassword = hospital.toLowerCase().replace(/\s/g,"") + "1234"

if(password === expectedPassword){

alert("Login successful")

document.getElementById("adminPanel").style.display="block"

closeAdminLogin()

}
else{

alert("Invalid credentials")

}

}



// =========================
// ADMIN DATA SAVE
// =========================

function submitAdminData(){

let hospital=document.getElementById("adminHospital").value

let patients=parseInt(document.getElementById("adminPatients").value)

let totalBeds=parseInt(document.getElementById("adminTotalBeds").value)

let occupiedBeds=parseInt(document.getElementById("adminOccupiedBeds").value)

let doctors=parseInt(document.getElementById("adminDoctors").value)

let key="hospital_"+hospital

let data={

current_patients:patients,
total_beds:totalBeds,
occupied_beds:occupiedBeds,
doctors_on_duty:doctors

}

localStorage.setItem(key,JSON.stringify(data))

let available=totalBeds-occupiedBeds

document.getElementById("adminMessage").innerText=
"Available Beds: "+available

}



// =========================
// FORECAST
// =========================

function generateForecast(base){

let arr=[]

for(let i=0;i<7;i++){
arr.push(base+Math.floor(Math.random()*20-10))
}

return arr

}



// =========================
// AI PREDICTION
// =========================

async function predict(){

let hospital=document.getElementById("hospital").value
let district=document.getElementById("district").value

if(!hospital){

alert("Please select hospital")

return

}

let monsoon=document.getElementById("monsoon").checked
let outbreak=document.getElementById("outbreak").checked

let key="hospital_"+hospital

let storedData=localStorage.getItem(key)

if(!storedData){

alert("Hospital data not entered by admin yet")

return

}

let parsed=JSON.parse(storedData)

let availableBeds=parsed.total_beds-parsed.occupied_beds

document.getElementById("availableBeds").innerText=availableBeds



let payload={

district:district,
current_patients:parsed.current_patients,
occupied_beds:parsed.occupied_beds,
total_beds:parsed.total_beds,
doctors_on_duty:parsed.doctors_on_duty,
monsoon:monsoon,
viral_outbreak:outbreak

}



try{

let response=await fetch("http://127.0.0.1:8000/predict",{

method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(payload)

})

if(!response.ok){
throw new Error("Server error")
}

let data=await response.json()

document.getElementById("load").innerText=data.predicted_patients

document.getElementById("beds").innerText=data.beds_required

document.getElementById("risk").innerText=data.risk_level

document.getElementById("doctors").innerText=
data.doctors_required



let suggestionBox=document.getElementById("suggestionBox")
let suggestionText=document.getElementById("suggestionText")

if(availableBeds<data.beds_required){

suggestionBox.style.display="block"

suggestionText.innerText=
"⚠ Bed shortage expected. Consider redirecting patients to nearby hospital."

}
else{

suggestionBox.style.display="block"

suggestionText.innerText=
"✅ Beds available in selected hospital."

}



let forecast=generateForecast(data.predicted_patients)

if(chart) chart.destroy()

chart=new Chart(document.getElementById("forecastChart"),{

type:"line",

data:{

labels:["Day1","Day2","Day3","Day4","Day5","Day6","Day7"],

datasets:[{

label:"7 Day Forecast",

data:forecast,

borderColor:"blue",

fill:false

}]

}

})

}

catch{

alert("Backend connection failed")

}

}