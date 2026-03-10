let chart



// hospital network

const hospitalData={

"Bihar":{

"Patna":["PMCH","IGIMS","AIIMS Patna"],

"Gaya":["ANMMCH","JPN Hospital","ID Hospital"],

"Muzaffarpur":["SKMCH","Sadar Hospital Muzaffarpur","Homi Bhabha Cancer Hospital"]

},


"Uttar Pradesh":{

"Lucknow":["KGMU","SGPGIMS","Balrampur Hospital"],

"Gorakhpur":["AIIMS Gorakhpur","NSCBD Hospital","District Women Hospital"],

"Varanasi":["Lal Bahadur Shastri Hospital","Pandit Deen Dayal Hospital"]

},


"Jharkhand":{

"Ranchi":["RIMS","CIP","RINPAS"],

"Dhanbad":["Central Hospital","Sadar Hospital","Divisional Hospital"],

"Jamshedpur":["MGM Medical College","Sadar Hospital Jamshedpur","Tata Main Hospital"]

}

}



// load hospital list for admin login

window.onload=function(){

let select=document.getElementById("adminHospital")

if(!select) return

select.innerHTML="<option>Select Hospital</option>"

Object.keys(hospitalData).forEach(state=>{

Object.keys(hospitalData[state]).forEach(district=>{

hospitalData[state][district].forEach(h=>{

select.innerHTML+=`<option value="${h}">${h}</option>`

})

})

})

}



// dropdown logic

function updateDistricts(){

let state=document.getElementById("state").value

let district=document.getElementById("district")

district.innerHTML="<option>Select District</option>"

Object.keys(hospitalData[state]).forEach(d=>{

district.innerHTML+=`<option value="${d}">${d}</option>`

})

}



function updateHospitals(){

let state=document.getElementById("state").value

let district=document.getElementById("district").value

let hospital=document.getElementById("hospital")

hospital.innerHTML="<option>Select Hospital</option>"

hospitalData[state][district].forEach(h=>{

hospital.innerHTML+=`<option value="${h}">${h}</option>`

})

}



// admin login

function openAdminLogin(){

document.getElementById("adminLoginModal").style.display="block"

}

function closeAdminLogin(){

document.getElementById("adminLoginModal").style.display="none"

}



function loginAdmin(){

let hospital=document.getElementById("adminHospital").value

let pass=document.getElementById("adminPassword").value

let expected=hospital.toLowerCase().replace(/\s/g,"")+"1234"

if(pass===expected){

localStorage.setItem("loggedHospital",hospital)

window.location.href="admin.html"

}

else{

alert("Invalid password")

}

}



// admin page logic

if(document.getElementById("hospitalName")){

let hospital=localStorage.getItem("loggedHospital")

document.getElementById("hospitalName").innerText="Hospital: "+hospital

}



function submitAdminData(){

let hospital=localStorage.getItem("loggedHospital")

let patients=parseInt(document.getElementById("adminPatients").value)

let totalBeds=parseInt(document.getElementById("adminTotalBeds").value)

let occupiedBeds=parseInt(document.getElementById("adminOccupiedBeds").value)

let doctors=parseInt(document.getElementById("adminDoctors").value)


let data={

current_patients:patients,

total_beds:totalBeds,

occupied_beds:occupiedBeds,

doctors_on_duty:doctors

}


localStorage.setItem("hospital_"+hospital,JSON.stringify(data))

document.getElementById("adminMessage").innerText="Data saved successfully"

}



// forecast

function generateForecast(base){

let arr=[]

for(let i=0;i<7;i++){

arr.push(base+Math.floor(Math.random()*20-10))

}

return arr

}



// prediction

async function predict(){

let hospital=document.getElementById("hospital").value

let district=document.getElementById("district").value

let monsoon=document.getElementById("monsoon").checked

let outbreak=document.getElementById("outbreak").checked


let stored=localStorage.getItem("hospital_"+hospital)

if(!stored){

alert("Admin data not entered yet")

return

}


let parsed=JSON.parse(stored)

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


let response=await fetch("http://127.0.0.1:8000/predict",{

method:"POST",

headers:{"Content-Type":"application/json"},

body:JSON.stringify(payload)

})


let data=await response.json()


document.getElementById("load").innerText=data.predicted_patients

document.getElementById("beds").innerText=data.beds_required

document.getElementById("risk").innerText=data.risk_level

document.getElementById("doctors").innerText=data.doctors_required


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