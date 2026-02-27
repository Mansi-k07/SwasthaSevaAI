let chart;

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
    let monsoon = document.getElementById("monsoon").checked;
    let outbreak = document.getElementById("outbreak").checked;

    let baseLoad = 100;

    if(district === "Patna") baseLoad = 140;
    if(district === "Gaya") baseLoad = 110;
    if(district === "Muzaffarpur") baseLoad = 125;

    // Surge calculation
    let surge = 0;
    if(monsoon) surge += baseLoad * 0.2;
    if(outbreak) surge += baseLoad * 0.3;

    let predictedLoad = Math.floor(baseLoad + surge);

    document.getElementById("load").innerText = predictedLoad;

    // Risk calculation
    let riskData = calculateRisk(predictedLoad);

    let riskElement = document.getElementById("risk");
    riskElement.innerText = riskData.level;
    riskElement.className = "risk " + riskData.class;

    document.getElementById("doctors").innerText = riskData.doctors;

    let bedsRequired = Math.floor(predictedLoad * 0.3);
    document.getElementById("beds").innerText = bedsRequired;

    // Color Logic
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