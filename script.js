var flightData = [];
var flightNumRequested = 10;
var prevFlightNumRequested = 0;
var start_idx = 0;

window.onload = () => {
    setFname();
    loadFlights(flightNumRequested, prevFlightNumRequested);
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
toggle.addEventListener("click", () => {
    console.log("toggle button is clicked");
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
    loadFlights1(arriv);
    appendDivs(flightNumRequested, prevFlightNumRequested);
    
})

// removes all flight blocks
function clearDiv() {
    let blocks = document.querySelector(".flights");
    while (blocks.firstChild) {
        blocks.removeChild(blocks.firstChild);
    }
}

// implement flightData array of objects
/*
If departure is retrieved,
flightData = [
    {
    date: "2023-03-01",
    time: "00:07",
    terminal: "1",
    gate: "1",
    aisle: "XD",
    status: "some status",
    destination: "AAB"
    flightNo: ["AA 1234", "AA 1235"],
    },...]

If arrival is retrieved,
flightData = [
    {
    date: "2023-03-01",
    time: "00:07",
    parking_stand: "S103",
    hall: "C",
    belt: "1",
    status: "some status",
    origin: "AAB",
    flightNo: ["AA 1234", "AA 1235"]
    },...]
*/
var testFlightList = [];

var loadFlights1 = (arriv) => {
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
                        "baggage": (flight["baggage"] == "")? "" : flight["baggage"]
                    } 
                    console.log(tempFlight);
                    tempFlight["flightsId"] = [];  
                    flight["flight"].forEach(fl => tempFlight["flightsId"].push(fl["no"]));
                    
                    testFlightList.push(tempFlight);
                }  
            })
        })
    })
}    

var appendDivs = (flightNumRequested, prevFlightNumRequested) => {
    let i =0;
    start_idx = 0;
    testFlightList.forEach(flight => {
        
        if (!arriv) {
            // create main sub div
            let flightBlk = document.createElement("div");
            flightBlk.setAttribute("id", "depart"+i);
        
            // scheduled time
            let timeblk = document.createElement("div");
            timeblk.setAttribute("id", "timeblock");
            timeblk.innerHTML = `Scheduled Time<p>`+flight["time"]+`</p>`;
        
            // flightIds and destination
            let desFlightblk = document.createElement("div");
            desFlightblk.setAttribute("id", "desFlightblk");
            let flights = "";
            flight["flightsId"].forEach(ele=>{
                flights+=ele;
            })
            desFlightblk.innerHTML = 
            `<div id="flight">Flight No.: <br>` + flights + `</div>` + 
            `<div id="des"><br>Destination (Airport): <br>` + flight["destination"]["airPort_city"] + " (" + flight["destination"]["airPort_name"] + `)</div>`;

            // status etc
            let misc = document.createElement("div");
            misc.setAttribute("id", "termStatusblock");
            misc.innerHTML = 
            `<div id="termBlock">Terminal: ` + flight["terminal"] + `</div>` +
            `<div id="aisle"><br>Aisle: ` + flight["aisle"] + `</div>` +
            `<div id="gate"><br>Gate: ` + flight["gate"] + `</div>` +
            `<div id="statusBlock"><br>Status: ` + flight["status"] + `</div>`;                      
            
            // append subblocks to flightBlk
            flightBlk.appendChild(timeblk);
            flightBlk.appendChild(desFlightblk);
            flightBlk.appendChild(misc);

            // append flightBlk to "flights" div
            let main = document.querySelector(".flights");
            main.appendChild(flightBlk);
            
        }
        else {

            // create main sub div
            let flightBlk = document.createElement("div");
            flightBlk.setAttribute("id", "depart"+i);
        
            // scheduled time
            let timeblk = document.createElement("div");
            timeblk.setAttribute("id", "timeblock");
            timeblk.innerHTML = `Scheduled Time<p>`+flight["time"]+`</p>`;

            // flightIds and origin
            let desFlightblk = document.createElement("div");
            desFlightblk.setAttribute("id", "desFlightblk");
            let flights = "";
            flight["flightsId"].forEach(ele=>{
                flights+=ele;
            })
            desFlightblk.innerHTML = 
            `<div id="flight">Flight No.: <br>` + flights + `</div>` + 
            `<div id="des"><br>Destination (Airport): <br>` + flight["origin"]["origin_city"] + " (" + flight["origin"]["origin_name"] + `)</div>`;

            // status etc
            let misc = document.createElement("div");
            misc.setAttribute("id", "termStatusblock");
            misc.innerHTML = 
            `<div id="termBlock">Parking stand: ` + flight["stand"] + `</div>` +
            `<div id="aisle"><br>Hall: ` + flight["hall"] + `</div>` +
            `<div id="gate"><br>Baggage: ` + flight["baggage"] + `</div>` +
            `<div id="statusBlock"><br>Status: ` + flight["status"] + `</div>`;                      
            
            // append subblocks to flightBlk
            flightBlk.appendChild(timeblk);
            flightBlk.appendChild(desFlightblk);
            flightBlk.appendChild(misc);

            // append flightBlk to "flights" div
            let main = document.querySelector(".flights");
            main.appendChild(flightBlk);

        }
        i++;
    })

    let j = 0;
    while (j < testFlightList.length) {

    }
    
    for (let j = 0; j < flightData.length;j++){
                
        let flightDiv = document.querySelector(".flights #depart"+j);
        if (j < Math.max(start_idx-prevFlightNumRequested,0) || j >= Math.min(start_idx+flightNumRequested, flightData.length)){
            flightDiv.style.display = "none";
        }
    }
    
    document.querySelector("#depart"+start_idx).setAttribute("style","background-color: blue");

    
}           









// var loadFlights = (flightNumRequested, prevFlightNumRequested) => {
//     flightData.length = 0;
//     fetch("flight.php?date=" + currentDay + "&lang=en&cargo=false&arrival=" + arriv)
//     .then(response => {
//         response.json().then(data =>{
            
//             let i = 0;
//             data.forEach(ele => { //ele is an object that contains "list" array
//                 console.log(ele);
//                 let currentdata = ele["list"];
//                 start_idx = 0;
                
//                 if (!arriv) { 
//                     //load all departure
//                     while (i<currentdata.length) {
                        
//                         let currentTimeData = currentdata[i];
                        
//                         // get required information
//                         // flight IDs are stored in flight_list array
//                         let schTime = currentTimeData["time"];
//                         let stat = (currentTimeData["status"] == "")? "" : currentTimeData["status"];
//                         let term = (currentTimeData["terminal"] == "")? "" : currentTimeData["terminal"];
//                         let aile = (currentTimeData["aisle"] == "")? "" : currentTimeData["aisle"];
//                         let gt = (currentTimeData["gate"] == "")? "" : currentTimeData["gate"];
//                         let flightDate = ele["date"];

//                         let des_airP = airpInfo[currentTimeData["destination"][0]]["name"];
//                         let des_cty = airpInfo[currentTimeData["destination"][0]]["location"];

//                         let flight_list = [];
//                         currentTimeData["flight"].forEach(ele =>{
//                             flight_list.push(ele["no"] + " ");
//                         })

//                         // store data inside flightData array of objects
//                         let tempFlightInfo = {};
//                         tempFlightInfo["date"] = flightDate;
//                         tempFlightInfo["time"] = schTime;
//                         tempFlightInfo["terminal"] = term;
//                         tempFlightInfo["gate"] = gt;
//                         tempFlightInfo["aisle"] = aile;
//                         tempFlightInfo["status"] = stat;
//                         tempFlightInfo["destination"] = currentTimeData["destination"][0];
//                         tempFlightInfo["flightNo"] = flight_list;

//                         flightData.push(tempFlightInfo);
                        
//                         // for debugging in console
//                         // console.log("i = "+i);
//                         // console.log("schTime = "+schTime);
//                         // console.log("status = "+stat);
//                         // console.log(flightDate+" currentDay: "+currentDay);
//                         // console.log(flightDate < currentDay);
//                         // console.log(
//                         //     "Terminal: " + term + " " +
//                         //     "Aisle: " + aile + " " +
//                         //     "Gate: " + gt
//                         // );
//                         // console.log(
//                         //     "Destination: " + des_cty +
//                         //     " (" + des_airP + ")"
//                         // );
//                         // console.log(...flight_list);
                        
    
//                         // create divs
//                         let flightBlk = document.createElement("div");
//                         flightBlk.setAttribute("id", "depart"+i);
    
//                         let timeblk = document.createElement("div");
//                         timeblk.setAttribute("id", "timeblock");
//                         timeblk.innerHTML = `Scheduled Time<p>`+schTime+`</p>`;
    
                        
//                         let desFlightblk = document.createElement("div");
//                         desFlightblk.setAttribute("id", "desFlightblk");
//                         let flights = "";
//                         flight_list.forEach(ele=>{
//                             flights+=ele;
//                         })
//                         desFlightblk.innerHTML = 
//                         `<div id="flight">Flight No.: <br>` + flights + `</div>` + 
//                         `<div id="des"><br>Destination (Airport): <br>` + des_cty + " (" + des_airP + `)</div>`;
    
//                         let misc = document.createElement("div");
//                         misc.setAttribute("id", "termStatusblock");
//                         misc.innerHTML = 
//                         `<div id="termBlock">Terminal: ` + term + `</div>` +
//                         `<div id="aisle"><br>Aisle: ` + aile + `</div>` +
//                         `<div id="gate"><br>Gate: ` + gt + `</div>` +
//                         `<div id="statusBlock"><br>Status: ` + stat + `</div>`;                      
                        
//                         // append subblocks to flightBlk
//                         flightBlk.appendChild(timeblk);
//                         flightBlk.appendChild(desFlightblk);
//                         flightBlk.appendChild(misc);
    
//                         // append flightBlk to "flights" div
//                         let main = document.querySelector(".flights");
//                         main.appendChild(flightBlk);

                        
//                         if (flightDate < currentDay || schTime < currentTime) {
//                             start_idx++;
//                         }
                        
//                         i++;
//                     }
//                 }
//                 else { 
//                     //load all arrival
//                     while (i<currentdata.length){

//                         let currentTimeData = currentdata[i];

//                         // get required information
//                         // flight IDs are stored in flight_list array
//                         let schTime = currentTimeData["time"];
//                         let stat = (currentTimeData["status"] == "")? "" : currentTimeData["status"];
//                         let stand = (currentTimeData["stand"] == "")? "" : currentTimeData["stand"];
//                         let hall = (currentTimeData["hall"] == "")? "" : currentTimeData["hall"];
//                         let bt = (currentTimeData["baggage"] == "")? "" : currentTimeData["baggage"];
//                         let ori_airP = airpInfo[currentTimeData["origin"][0]]["name"];
//                         let ori_cty = airpInfo[currentTimeData["origin"][0]]["location"];
//                         let flightDate = ele["date"];
//                         let flight_list = [];
//                         currentTimeData["flight"].forEach(ele =>{
//                             flight_list.push(ele["no"] + " ");
//                         })

//                         // store arrival data inside flightData array of objects
//                         let tempFlightInfo = {};
//                         tempFlightInfo["date"] = ele["date"];
//                         tempFlightInfo["time"] = schTime;
//                         tempFlightInfo["stand"] = stand;
//                         tempFlightInfo["hall"] = hall;
//                         tempFlightInfo["bell"] = bt;
//                         tempFlightInfo["status"] = stat;
//                         tempFlightInfo["origin"] = currentTimeData["origin"][0];
//                         tempFlightInfo["flightNo"] = flight_list;
                        
//                         flightData.push(tempFlightInfo);
                        

//                         // for debugging in console
//                         // console.log("i = "+i);
//                         // console.log("schTime = "+schTime);
//                         // console.log("status = "+stat);
//                         // console.log(
//                         //     "Parking stand: " + stand + " " +
//                         //     "Hall: " + hall + " " +
//                         //     "Belt: " + bt
//                         // );
//                         // console.log(
//                         //     "Origin: " + ori_cty +
//                         //     " (" + ori_airP + ")"
//                         // );
//                         // console.log(...flight_list);
                        

//                         // create divs
//                         let flightBlk = document.createElement("div");
//                         flightBlk.setAttribute("id", "depart"+i);

//                         let timeblk = document.createElement("div");
//                         timeblk.setAttribute("id", "timeblock");
//                         timeblk.innerHTML = `Scheduled Time<p>`+schTime+`</p>`;

                        
//                         let desFlightblk = document.createElement("div");
//                         desFlightblk.setAttribute("id", "desFlightblk");
//                         let flights = "";
//                         flight_list.forEach(ele=>{
//                             flights+=ele;
//                         })
//                         desFlightblk.innerHTML = 
//                         `<div id="flight">Flight No.: <br>` + flights + `</div>` + 
//                         `<div id="des"><br>Origin (Airport): <br>` + ori_cty + " (" + ori_airP + `)</div>`;

//                         let misc = document.createElement("div");
//                         misc.setAttribute("id", "termStatusblock");
//                         misc.innerHTML = 
//                         `<div id="termBlock">Parking stand: ` + stand + `</div>` +
//                         `<div id="aisle"><br>Hall: ` + hall + `</div>` +
//                         `<div id="gate"><br>Belt: ` + bt + `</div>` +
//                         `<div id="statusBlock"><br>Status: ` + stat + `</div>`;                      
                        
//                         // append subblocks to flightBlk
//                         flightBlk.appendChild(timeblk);
//                         flightBlk.appendChild(desFlightblk);
//                         flightBlk.appendChild(misc);

//                         // append flightBlk to "flights" div
//                         let main = document.querySelector(".flights");
//                         main.appendChild(flightBlk);

//                         console.log("============================");
//                         console.log("schTime "+schTime);
//                         console.log("currentTime "+currentTime);

                        
//                         if (flightDate <= currentDay || schTime < currentTime) {
//                             console.log("entered loop");
//                             console.log("start_idx= "+start_idx);
//                             start_idx++;
//                         }
                        
//                         i++;
//                     }
//                 }  
//             })
   
            
//             console.log(start_idx);
//             for (let j = 0; j < flightData.length;j++){
                
//                 let flightDiv = document.querySelector(".flights #depart"+j);
//                 if (j < Math.max(start_idx-prevFlightNumRequested,0) || j >= Math.min(start_idx+flightNumRequested, flightData.length)){
//                     flightDiv.style.display = "none";
//                 }
//             }
            
//             document.querySelector("#depart"+start_idx).setAttribute("style","background-color: blue");
            
//         })
//     })
// }

loadMore.addEventListener("click", ()=>{
    clearDiv();
    flightNumRequested+=10;
    console.log("flightNumRequested+start_idx "+flightNumRequested+start_idx);
    if (flightNumRequested + start_idx >= flightData.length) {
        flightNumRequested = flightData.length - start_idx;
        loadMore.style.display = "none";
    }

    loadFlights1(arriv);
    appendDivs(flightNumRequested,prevFlightNumRequested);

})

loadPrev.addEventListener("click", ()=>{
    clearDiv();
    prevFlightNumRequested+=10;
    if (start_idx - prevFlightNumRequested <= 0){
        console.log("start_idx - prevFlightNumRequested <= 0, so loadPrev button is invisible");
        loadPrev.style.display = "none";
    }
    loadFlights1(arriv);
    appendDivs(flightNumRequested,prevFlightNumRequested);
})
