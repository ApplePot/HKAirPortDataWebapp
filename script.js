var flightData = [];
var flightNumRequested = 10;
var prevFlightNumRequested = 0;
var start_idx = 0;

window.onload = () => {
    setFname();
    loadFlights1(flightNumRequested,prevFlightNumRequested,false);
}
// array of objects, keys are iata_code, values are objects {name, municipality}\
// e.g. [ "AAA": {"name": "xxxxxxxxx", }
var airpInfo = [];

var setFname = () => {
    fetch("iata.json")
    .then(response => {
        response.json().then(data =>{
            data.forEach(element => {
                let airPortCode = element["iata_code"];
                let airPortName = element["name"];
                let airPortLoc = element["municipality"];

                let airFInfo = {};
                airFInfo["name"] = airPortName;
                airFInfo["location"] = airPortLoc;

                airpInfo[airPortCode] = airFInfo;

            })
        })
    })

}

// get current date, month in full english
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var month = today.toLocaleString('en', { month: 'long' });
var yyyy = today.getFullYear();

var date = document.querySelector(".day");
date.innerText = "Date: " + dd + " " + month + " " + yyyy;

if (today.getMonth()+1 < 10) {
    var currentDay = yyyy+"-0"+(today.getMonth()+1)+"-"+dd;
}
// var currentDay = yyyy+"-"+(today.getMonth()+1)+"-"+dd;
var currentTime = today.getHours()+":"+today.getMinutes();

var loadMore = document.querySelector(".loadMore");
var loadPrev = document.querySelector(".loadPrev");


// set toggle button animation
var arriv = false;
var toggle = document.querySelector("label");
loadMore.style.display = "block";
loadPrev.style.display = "block";
toggle.addEventListener("click", () => {
    toggle.innerHTML = (toggle.innerHTML == "Departure") ? "Arrival" : "Departure";
    
    let info = document.querySelector(".info");
    info.innerHTML = toggle.innerHTML + " information";
    
    arriv = !(toggle.innerHTML == "Departure");
    
    flightNumRequested = 10;
    prevFlightNumRequested = 0;
    
    flightData.length = 0;
    
    // reset the buttons once toggle button is pressed
    loadMore.style.display = "block";
    loadPrev.style.display = "block";
    
    clearDiv();
    loadFlights1(flightNumRequested, prevFlightNumRequested, arriv);
    
})

// removes all flight blocks
function clearDiv() {
    let blocks = document.querySelector(".flights");
    while (blocks.firstChild) {
        blocks.removeChild(blocks.firstChild);
    }
}


var testFlightList = [];

var loadFlights1 = (flightNumRequested, prevFlightNumRequested, arriv) => {
    testFlightList.length = 0;
    fetch("flight.php?date=" + currentDay + "&lang=en&cargo=false&arrival=" + arriv)
    .then(response => {
        if (response.ok){
            console.log("Fetching success");
            return response.json();
        }    
        else {
            console.log("Fetching failed");
        }
    })
    .then(data => {
        
        data.forEach(element => {
            
            let date = element["date"];

            element["list"].forEach(flight => {
                // create new object for new flight time entry
                if (!arriv) {

                    let tempFlight = {
                        "date": date,
                        "time": flight["time"],
                        "destination": {
                            "airPort_name": airpInfo[flight["destination"][0]]["name"],
                            "airPort_city": airpInfo[flight["destination"][0]]["location"]
                        },
                        "status": (flight["status"] == "")? "" : flight["status"],
                        "terminal": flight["terminal"],
                        "aisle": flight["aisle"],
                        "gate": flight["gate"],
                    } 
                    tempFlight["flightsId"] = [];  
                    flight["flight"].forEach(fl => tempFlight["flightsId"].push(fl["no"]));
                    
                    testFlightList.push(tempFlight);
                }
                else {
                    
                    let tempFlight = {
                        "date": date,
                        "time": flight["time"],
                        "origin": {
                            "origin_name": airpInfo[flight["origin"][0]]["name"],
                            "origin_city": airpInfo[flight["origin"][0]]["location"]
                        },
                        "status": (flight["status"] == "")? "" : flight["status"],
                        "stand": (flight["stand"] == "")? "" : flight["stand"],
                        "hall": (flight["hall"] == "")? "" : flight["hall"],
                        "belt": (flight["baggage"] == "")? "" : flight["baggage"]
                    } 
                    tempFlight["flightsId"] = [];  
                    flight["flight"].forEach(fl => tempFlight["flightsId"].push(fl["no"]));
                    
                    testFlightList.push(tempFlight);
                }  
            })
        })

        appendDivs(flightNumRequested, prevFlightNumRequested, arriv);
    })
}    

function appendDivs (flightNumRequested, prevFlightNumRequested, arriv) {
    start_idx = 0;
    visiblie_count = 0;
    testFlightList.forEach((element, index)=>{       
        if (!arriv) {

            let flightBlk = document.createElement("div");
            flightBlk.setAttribute("id", "depart"+index);
            
            let timeblk = document.createElement("div");
            timeblk.setAttribute("id", "timeblock");
            timeblk.innerHTML = `<b>Scheduled Time</b><p>`+element.time+`</p>`;
            
            
            let desFlightblk = document.createElement("div");
            desFlightblk.setAttribute("id", "desFlightblk");
            let flights = "";
            element.flightsId.forEach(ele=>{
                    flights+=ele+" ";
                })
            desFlightblk.innerHTML = 
            `<div id="flight"><b>Flight No.:</b> <br>` + flights + `</div>` + 
            `<div id="des"><br><b>Destination (Airport):</b> <br>` + element.destination.airPort_city + " (" + element.destination.airPort_name + `)</div>`;
                
            let misc = document.createElement("div");
            misc.setAttribute("id", "termStatusblock");
            misc.innerHTML = 
            `<div id="termBlock"><b>Terminal:</b> ` + element.terminal + `</div>` +
            `<div id="aisle"><br><b>Aisle:</b> ` + element.aisle + `</div>` +
            `<div id="gate"><br><b>Gate:</b> ` + element.gate + `</div>` +
            `<div id="statusBlock"><br><b>Status:</b> ` + element.status + `</div>`;                      
                
            // append subblocks to flightBlk
            flightBlk.appendChild(timeblk);
            flightBlk.appendChild(desFlightblk);
            flightBlk.appendChild(misc);
                
            // append flightBlk to "flights" div
            let main = document.querySelector(".flights");
            main.appendChild(flightBlk);
                                
        }
        else {
                     
            let flightBlk = document.createElement("div");
            flightBlk.setAttribute("id", "depart"+index);
            
            let timeblk = document.createElement("div");
            timeblk.setAttribute("id", "timeblock");
            timeblk.innerHTML = `Scheduled Time<p>`+element.time+`</p>`;
            
            
            let desFlightblk = document.createElement("div");
            desFlightblk.setAttribute("id", "desFlightblk");
            let flights = "";
            element.flightsId.forEach(ele=>{
                    flights+=ele+" ";
            })
            desFlightblk.innerHTML = 
            `<div id="flight"><b>Flight No.:</b> <br>` + flights + `</div>` + 
            `<div id="des"><br><b>Origin (Airport):</b> <br>` + element.origin.origin_city + " (" + element.origin.origin_name + `)</div>`;
                
            let misc = document.createElement("div");
            misc.setAttribute("id", "termStatusblock");
            misc.innerHTML = 
            `<div id="termBlock"><b>Parking stand:</b> ` + element.stand + `</div>` +
            `<div id="aisle"><br><b>Hall:</b> ` + element.hall + `</div>` +
            `<div id="gate"><br><b>Belt:</b> ` + element.belt + `</div>` +
            `<div id="statusBlock"><br><b>Status:</b> ` + element.status + `</div>`;                      
                
            // append subblocks to flightBlk
            flightBlk.appendChild(timeblk);
            flightBlk.appendChild(desFlightblk);
            flightBlk.appendChild(misc);
                
            // append flightBlk to "flights" div
            let main = document.querySelector(".flights");
            main.appendChild(flightBlk);
        }
        if ((element.date + element.time) <= (currentDay + currentTime)){
            start_idx++;
        } 
    })
    
    for (let i = 0; i< testFlightList.length;i++){
        if (!(i >= Math.max(start_idx-prevFlightNumRequested, 0) && i <Math.min(start_idx+flightNumRequested, testFlightList.length))) {
            document.querySelector("#depart"+i).style.display = "none";
        }
    }

}

loadMore.addEventListener("click", ()=>{
    clearDiv();
    flightNumRequested+=10;
    if (flightNumRequested + start_idx >= testFlightList.length){
        loadMore.style.display = "none";
    }
    loadFlights1(flightNumRequested, prevFlightNumRequested, arriv);

})

loadPrev.addEventListener("click", ()=>{
    clearDiv();
    prevFlightNumRequested+=10;
    if (start_idx-prevFlightNumRequested <= 0){
        loadPrev.style.display = "none";
    }
    loadFlights1(flightNumRequested, prevFlightNumRequested, arriv);
})
