let chart;

function generateDummyForecast(baseLoad) {
    let forecast = [];
    for(let i=0;i<7;i++){
        forecast.push(baseLoad + Math.floor(Math.random()*20 - 10));
    }
    return forecast;
}

function calculateRisk(load){
    if(load < 150) return {level:"Low", class:"low", doctors:8};
    if(load < 220) return {level:"Medium", class:"medium", doctors:10};
    return {level:"High", class:"high", doctors:14};
}

function predict(){

    let district = document.getElementById("district").value;
    let monsoon = document.getElementById("monsoon").checked;
    let outbreak = document.getElementById("outbreak").checked;

    let baseLoad = 100;

    if(district === "Patna") baseLoad = 140;
    if(district === "Gaya") baseLoad = 110;
    if(district === "Muzaffarpur") baseLoad = 125;

    if(monsoon) baseLoad += 20;
    if(outbreak) baseLoad += 35;

    document.getElementById("load").innerText = baseLoad;

    let riskData = calculateRisk(baseLoad);

    let riskElement = document.getElementById("risk");
    riskElement.innerText = riskData.level;
    riskElement.className = "risk " + riskData.class;

    document.getElementById("doctors").innerText = riskData.doctors;

    let forecast = generateDummyForecast(baseLoad);

    if(chart) chart.destroy();

    chart = new Chart(document.getElementById("forecastChart"), {
        type: 'line',
        data: {
            labels: ["Day1","Day2","Day3","Day4","Day5","Day6","Day7"],
            datasets: [{
                label: "7-Day Emergency Forecast",
                data: forecast,
                borderColor: "blue",
                fill:false
            }]
        }
    });
}