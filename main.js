
const watchID = navigator.geolocation.watchPosition(function(position){
    console.log(position)
    document.getElementById("text1").innerText = position.coords.latitude;
    document.getElementById("text2").innerText = position.coords.longitude;
    lastLocationTime = position.timestamp},
    geolocationErrorHandler,{timeout:5000});


function initSensor(){
    const options = { frequency: 60};
    console.log(JSON.stringify(options));
    sensor = new AbsoluteOrientationSensor(options);
    sensor.onreading = function(){
        let res = convertQuaternionToDirection(sensor.quaternion)
        //document.getElementById("text0").innerText = sensor.quaternion[2];
        document.getElementById("text3").innerText = Math.atan2(res[1],res[2])/Math.PI;
    }
    sensor.onerror = (event) => {
        if (event.error.name == 'NotReadableError') {
            console.log("Sensor is not available.");
            alert("Sensor not available")
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
        document.getElementById("text1").innerText = position.coords.latitude;
        document.getElementById("text2").innerText = position.coords.longitude;},
        function(error){
            console.log(error);
            document.getElementById("text1").innerText = "Please turn on GPS and allow permissions"
            document.getElementById("text2").innerText = ""
            
        },{timeout:5000});
}

function geolocationErrorHandler(error){

    console.log(error);
    document.getElementById("text1").innerText = "Please turn on GPS and allow permissions, then refresh"
    document.getElementById("text2").innerText = ""
    

}

async function copyValues(){
    let lat = document.getElementById("text1").innerText;
    let lng = document.getElementById("text2").innerText;
    let dir = document.getElementById("text3").innerText*180;
    if (lng==""){
        alert("Failed to get location")
        return;
    }
    if (dir==NaN){
        alert("Failed to get direction")
    }
    window.focus()
    await window.navigator.clipboard.writeText("{\"lat\":"+lat+", \"lng\":"+lng+", \"dir\":"+dir+"}");

    alert("Values copied to clipboard")

}

let sensor;
let lastLocationTime = new Date().getTime()

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
    alert("location not supported by browser")
}
else{
    window.setInterval(()=>{
        if (new Date().getTime()-lastLocationTime>5000){
            geolocationErrorHandler("no updates in last 5 seconds")
        }
    },1000)
}
