let map;


let AdvancedMarkerElement2;

async function initMap(){
    let position = {lat:1.3637498,lng:103.8019293};
    const { Map } = await google.maps.importLibrary("maps");
    
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    AdvancedMarkerElement2 = AdvancedMarkerElement;

    map = new Map(document.getElementById("map"), {
        zoom: 11,
        center: position,
        mapId: "DEMO_MAP_ID",
    });


    if (!"geolocation" in navigator){
        //alert("location not supported by browser")
    }
    else{
        navigator.geolocation.getCurrentPosition(function(p){
            console.log(p);
            map.setCenter({lat:p.coords.latitude,lng:p.coords.longitude});
        })
    }
    

    for (let i = 0; i<sampleReports.length; i++){
        addReportToMap(sampleReports[i],map)
        
    }
}
let sampleReports = [
    {lat:1.4286943,lng:103.8251929,dir:45},
    {lat:1.4262558,lng:103.8372501,dir:-30},
    {lat:1.4397857,lng:103.8330017,dir:180}
]

initMap();

function addReportToMap(report,map){
    genPolyline(report).setMap(map);
    
    new AdvancedMarkerElement2({
        map,
        position:{lat:report.lat,lng:report.lng}
    })
}

function genPolyline(report){
    const lineLength = 0.027;
    dirRad = report.dir/180*Math.PI;
    path = [
        {lat:report.lat,lng:report.lng},
        {lat:report.lat+lineLength*Math.cos(dirRad),lng:report.lng+lineLength*Math.sin(dirRad)}
    ]
    return new google.maps.Polyline({
        path:path
    })
}

function addReport(){
    data = window.prompt("Paste data here")
    addReportToMap(JSON.parse(data),map);
}