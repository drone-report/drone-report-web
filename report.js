
let sensor;
let lastLocationTime = 0;
let curLat,curLng,curDir;


const watchID = navigator.geolocation.watchPosition(function(position){
    console.log(position)
    curLat = position.coords.latitude;
    curLng = position.coords.longitude;
    lastLocationTime = position.timestamp;
    hideGPSError();
},
    geolocationErrorHandler);


function initSensor(){
    const options = { frequency: 60};
    console.log(JSON.stringify(options));
    sensor = new AbsoluteOrientationSensor(options);
    sensor.onreading = function(){
        let res = convertQuaternionToDirection(sensor.quaternion)
        //document.getElementById("text0").innerText = sensor.quaternion[2];
        curDir = Math.atan2(res[1],res[2])/Math.PI*-180;
        hideCompassError();
    }
    sensor.onerror = (event) => {
        if (event.error.name == 'NotReadableError') {
            console.log("Sensor is not available.");
            showCompassError("Compass sensor not available")
        }
    }
    sensor.start();
}

function convertQuaternionToDirection(q){
    return [2*q[1]*q[3]+2*q[0]*q[2],2*q[2]*q[3]-2*q[0]*q[1],1-2*q[1]*q[1]-2*q[2]*q[2]]
}

function getLocation(){
    console.log("getting location")
    navigator.geolocation.getCurrentPosition(function(position){
        console.log(position)
        curLat = position.coords.latitude;
        curLng = position.coords.longitude;
        hideGPSError();
    },
       geolocationErrorHandler,{timeout:5000});
}

function geolocationErrorHandler(error){

    console.log(error);
    showGPSError(error);
    

}

async function copyValues(){
    let lat = curLat;
    let lng = curLng;
    let dir = curDir;
    if (lng==""){
        alert("Failed to get location")
        return;
    }
    if (dir==null){
        alert("Failed to get direction")
    }
    else{
        dir = dir*-180;
    }
    addReportToMap({lat:lat,lng:lng,dir:dir},map);
    window.focus()
    await window.navigator.clipboard.writeText("{\"lat\":"+lat+", \"lng\":"+lng+", \"dir\":"+dir+"}");

    //alert("Values copied to clipboard")

}


if (navigator.permissions) {
    // https://w3c.github.io/orientation-sensor/#model
    Promise.all([navigator.permissions.query({ name: "accelerometer" }),
                    navigator.permissions.query({ name: "magnetometer" }),
                    navigator.permissions.query({ name: "gyroscope" })])
            .then(results => {
                if (results.every(result => result.state === "granted")) {
                    initSensor();
                } else {
                    console.log("Permission to use sensor was denied.");
                    showCompassError("Permission to use sensor was denied.");
                }
            }).catch(err => {
                console.log("Integration with Permissions API is not enabled, still try to start app.");
                initSensor();
            });
} else {
    console.log("No Permissions API, still try to start app.");
    initSensor();
}


if (!"geolocation" in navigator){
    geolocationErrorHandler("Location not supported by browser")
}
else{
    window.setInterval(()=>{
        if (new Date().getTime()-lastLocationTime>5000){
            //geolocationErrorHandler("no location updates in last 5 seconds")
        }
    },1000)
}

function showGPSError(error){
    curLat = null;
    curLng = null;
    document.getElementById("GPSErrorText").innerText = error
}

function hideGPSError(){
    document.getElementById("GPSErrorText").innerText = "";
}

function showCompassError(error){
    curDir = null;
    document.getElementById("CompassErrorText").innerText = error;
}

function hideCompassError(){
    document.getElementById("CompassErrorText").innerText = "";
}

document.getElementById("reportCancelBtn").style.display = "none";
document.getElementById("reportSubmitBtn").style.display = "none";

function startReport(){
    document.getElementById("reportBtn").style.display = "none";
    document.getElementById("reportCancelBtn").style.display = "inline-block";
    document.getElementById("reportSubmitBtn").style.display = "inline-block";
    addMapSelfDisplay();
}

function endReport(){
    document.getElementById("reportBtn").style.display = "inline-block";
    document.getElementById("reportCancelBtn").style.display = "none";
    document.getElementById("reportSubmitBtn").style.display = "none";
    removeMapSelfDisplay();
}

function submitReport(){
    if (curLat==null || curLng==null || curDir==null){
        alert("Unable to get required data (either GPS or compass not working)")
        return;
    }
    if (new Date().getTime()-lastLocationTime>5000){
        if (!window.confirm("No location updates received since "+new Date(lastLocationTime).toLocaleString()+". Are you sure you want to proceed?")){
            return;
        }
    }
    addReportToMap({lat:curLat,lng:curLng,dir:curDir},map);
    endReport();
}