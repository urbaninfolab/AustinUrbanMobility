/*
Real-Time Fire Incident Map

Created under Dr. Jiao's Urban Information Lab.
*/

let transitLocations = new L.FeatureGroup();
let scooterLocations = new L.FeatureGroup();
let incidentLocations = new L.FeatureGroup();
var markers = L.markerClusterGroup({
    showCoverageOnHover: false,
    //zoomToBoundsOnClick: false,
    iconCreateFunction: function(cluster) {
        var childCount = cluster.getChildCount();
        var markers = cluster.getAllChildMarkers();
        var sum = 0;
        for (var i = 0; i < markers.length; i++) {
            //console.log(markers[i]);
            sum += markers[i].options.title;
        }
        var avg = sum / markers.length;

    var c = ' marker-cluster-';
    if (avg < 10) {
        c += 'small';
    } else if (avg < 100) {
        c += 'medium';
    } else {
        c += 'large';
    }

    return new L.DivIcon({ html: '<div><span><b>' + Math.round(avg) + '</b></span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
        }
});

var transit_markers = L.markerClusterGroup({
    showCoverageOnHover: false,
    //zoomToBoundsOnClick: false,
    iconCreateFunction: function(cluster) {
        var childCount = cluster.getChildCount();
        var markers = cluster.getAllChildMarkers();
        return new L.DivIcon({ html: '<div><span><b>' + childCount + '</b></span></div>', className: 'marker-cluster marker-cluster-black', iconSize: new L.Point(40, 40) });
    }
});

var scooter_markers = L.markerClusterGroup({
    showCoverageOnHover: false,
    //zoomToBoundsOnClick: false,
    iconCreateFunction: function(cluster) {
        var childCount = cluster.getChildCount();
        var markers = cluster.getAllChildMarkers();
        return new L.DivIcon({ html: '<div><span><b>' + childCount + '</b></span></div>', className: 'marker-cluster marker-cluster-darkgreen', iconSize: new L.Point(40, 40) });
    }
});

var archived_incident_markers = L.markerClusterGroup({
    showCoverageOnHover: false,
    //zoomToBoundsOnClick: false,
    iconCreateFunction: function(cluster) {
        var childCount = cluster.getChildCount();
        var markers = cluster.getAllChildMarkers();
        return new L.DivIcon({ html: '<div><span><b>' + childCount + '</b></span></div>', className: 'marker-cluster marker-cluster-darkorange', iconSize: new L.Point(40, 40) });
    }
});

function new_transit_cluster_layer() {
    let cluster_layer = L.markerClusterGroup({
        showCoverageOnHover: false,
        //zoomToBoundsOnClick: false,
        iconCreateFunction: function(cluster) {
            var childCount = cluster.getChildCount();
            var markers = cluster.getAllChildMarkers();
            return new L.DivIcon({ html: '<div><span><b>' + childCount + '</b></span></div>', className: 'marker-cluster marker-cluster-black', iconSize: new L.Point(40, 40) });
        }
    });
    return cluster_layer
};
function new_scooter_cluster_layer() {
    let cluster_layer = L.markerClusterGroup({
        showCoverageOnHover: false,
        //zoomToBoundsOnClick: false,
        iconCreateFunction: function(cluster) {
            var childCount = cluster.getChildCount();
            var markers = cluster.getAllChildMarkers();
            return new L.DivIcon({ html: '<div><span><b>' + childCount + '</b></span></div>', className: 'marker-cluster marker-cluster-darkgreen', iconSize: new L.Point(40, 40) });
        }
    });
    return cluster_layer
};
function new_archived_incident_cluster_layer() {
    let cluster_layer = L.markerClusterGroup({
        showCoverageOnHover: false,
        //zoomToBoundsOnClick: false,
        iconCreateFunction: function(cluster) {
            var childCount = cluster.getChildCount();
            var markers = cluster.getAllChildMarkers();
            return new L.DivIcon({ html: '<div><span><b>' + childCount + '</b></span></div>', className: 'marker-cluster marker-cluster-darkorange', iconSize: new L.Point(40, 40) });
        }
    });
    return cluster_layer
};


    function addMapLayer(map) {
        // L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=podpBxEPp3rRpfqa6JY8', {
        //     attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
        // }).addTo(map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        console.log("BEING CALLED");
    }

    // placeholders for the L.marker and L.circle representing user's current position and accuracy
    var current_position, current_accuracy;

    function onLocationFound(e) {
    // if position defined, then remove the existing position marker and accuracy circle from the map
    console.log("location found");
    //console.log(e);

    if (current_position) {
        map.removeLayer(current_position);
        map.removeLayer(current_accuracy);
    }

    var radius = e.coords.accuracy / 10;

    const latlng = {
        lat: e.coords.latitude,
        lng: e.coords.longitude
    };

    /*const latlng = {          // Debug coordinates
        lat: 30.508119,
        lng: -97.811024
    };*/
    
    current_position = L.marker(latlng).addTo(map);
    current_accuracy = L.circle(latlng, radius).addTo(map);

    map.setView(latlng);
    map.fitBounds(current_accuracy.getBounds());


    }

    function foundLocationGeocoded(e) {
        
    if (current_position) {
        map.removeLayer(current_position);
        map.removeLayer(current_accuracy);
    }

    var radius = 10;

    const latlng = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
    };

    /*const latlng = {          // Debug coordinates
        lat: 30.508119,
        lng: -97.811024
    };*/
    
    current_position = L.marker(latlng).addTo(map);
    current_accuracy = L.circle(latlng, radius).addTo(map);

    map.setView(latlng);
    map.fitBounds(current_accuracy.getBounds());


    }


    function onLocationError(e) {
        console.error("Location found error");
        console.log(e);
    }

    function getUserLocation() {
        navigator.geolocation.getCurrentPosition(onLocationFound);

        /*navigator.geolocation.watchPosition(onLocationFound, onLocationError, {
        maximumAge: 60000,
        timeout: 2000
        });*/
    }

    var poiMarkers = [];

    function buildPOIMap() {

        // Delete all markers
        for (var i = 0; i < poiMarkers.length; i++) {
            poiMarkers[i].remove();
        }

        var fireDept = document.querySelector(".firedept").checked;
        var policeDept = document.querySelector(".policedept").checked;
        var hospital = document.querySelector(".hospital").checked;


        console.log("POI radio button clicked");
        // display csv file from POI.csv
        var filePath = './data/POI.csv';
        var result;
        fetch(filePath)
            .then(response => {
            return response.text();
        })
        .then(data => {
            result = data;
            var lines = result.replace("\\", "").replace("\\\r","").split('\n');
            var headers = lines[0].split(',');
            var jsonResult = [];
            for (var i = 1; i < lines.length; i++) {
                var obj = {};
                var currentline = lines[i].split(',');
                var valid = true;
                for (var j = 0; j < headers.length; j++) {
                    if (currentline[j] == undefined) 
                        valid = false;
                    obj[headers[j]] = currentline[j];
                }
                if (valid) 
                jsonResult.push(obj);
            }
            //console.log(jsonResult);
            for (var i = 0; i < jsonResult.length; i++) {
                console.log(jsonResult[i]);

                var iconLink = "assets/images/firedept.png";
                var type = "Fire";
                if(jsonResult[i]["Jurisdiction Name"] == "APD") {
                    iconLink = "assets/images/policedept.png";
                    type = "Police";
                }
                else if(jsonResult[i]["Jurisdiction Name"] == "AHD") {
                    iconLink = "assets/images/hospital.png";
                    type = "Medical";
                }

                console.log("Type: " + type);

                // Perform checkbox booleans
                if(!fireDept && !policeDept && !hospital)
                    continue
                else if(!fireDept && !policeDept && hospital && type != "Medical")
                    continue
                else if(!fireDept && policeDept && !hospital && type != "Police")
                    continue
                else if(!fireDept && policeDept && hospital && type != "Police" && type != "Medical")
                    continue
                else if(fireDept && !policeDept && !hospital && type != "Fire")
                    continue
                else if(fireDept && !policeDept && hospital && type != "Fire" && type != "Medical")
                    continue
                else if(fireDept && policeDept && !hospital && type != "Fire" && type != "Police")
                    continue
                else if(fireDept && policeDept && hospital && type != "Fire" && type != "Police" && type != "Medical")
                    continue
                

                var marker = L.marker([jsonResult[i].Y, jsonResult[i].X]).addTo(map);
                // Change the icon to a custom icon
                marker.setIcon(L.icon({
                    iconUrl: iconLink,
                    iconSize: [70, 70],
                    iconAnchor: [10, 10],
                    popupAnchor: [25, -10]
                }));

                marker.bindPopup( type + " Station: " + jsonResult[i].Name);

                // store marker in array to be deleted later
                poiMarkers.push(marker);
                
            }
        });
    }


    function buildTranMap() {
        for (let i = 0; i < transitLocations.length; i++) {
            transitLocations[i].remove();
        }
        if (!document.querySelector(".transit").checked) {
            // Hide loading overlay when checkbox is unchecked
            hideLoadingOverlay();
            return
        }
        let transit = document.querySelector(".transit").checked;
        // mobility JSON data
        if (transit) {
            // Show loading overlay
            showLoadingOverlay('Loading transit location data...');
            
            transit_markers = new_transit_cluster_layer();
            // Try direct fetch first, then fallback to CORS proxy if needed
            const transitUrl = 'https://smartcity.tacc.utexas.edu/data/transportation/transitposition.json';
            const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(transitUrl);
            
            // Try direct fetch with explicit CORS mode
            fetch(transitUrl, {
                mode: 'cors',
                credentials: 'omit'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json(); 
                })
                .catch(error => {
                    console.log('Direct fetch failed, trying CORS proxy:', error);
                    // Fallback to CORS proxy
                    return fetch(proxyUrl, {
                        mode: 'cors',
                        credentials: 'omit'
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Proxy fetch failed');
                        }
                        return response.json();
                    });
                })
                .then(transit_json => {
                    console.log(transit_json);
                    
                    // Hide loading overlay
                    hideLoadingOverlay();
                    
                    if (!transit_json || !transit_json["entity"]) {
                        console.error('Invalid transit data format');
                        return;
                    }
                    
                    for (let i = 0; i < transit_json["entity"].length; i++) {
                        if (!transit_json["entity"][i]["vehicle"] || !transit_json["entity"][i]["vehicle"].hasOwnProperty("trip")) {
                            continue;
                        }
                        let y = transit_json["entity"][i]["vehicle"]["position"]["latitude"];
                        let x = transit_json["entity"][i]["vehicle"]["position"]["longitude"];
                        let transit_marker = new L.marker([y,x]);
                        let iconLink = "assets/images/bus_icon.png";
                        transit_marker.setIcon(L.icon({
                            iconUrl: iconLink,
                            iconSize: [24, 32],
                            iconAnchor: [12, 32],
                            popupAnchor: [0, -30]
                        }));
                        var route_id = transit_json["entity"][i]["vehicle"]["trip"]["routeId"]
                        var vehicle_id = transit_json["entity"][i]["id"]
                        var speed = transit_json["entity"][i]["vehicle"]["position"]["speed"]
                        transit_marker.bindPopup(" Vehicle ID: " + vehicle_id + ", Route: " + route_id + ", Speed: " + speed + "m/s");
            
                        transit_markers.addLayer(transit_marker)
                        transitLocations.addLayer(transit_marker)
                    }
                    map.addLayer(transit_markers)
                })
                .catch(error => {
                    console.error('Error fetching transit data:', error);
                    // Hide loading overlay on error
                    hideLoadingOverlay();
                    alert('Failed to load transit location data. This may be due to CORS restrictions. Please contact the administrator.');
                });
        }
        
    }


    function buildScooterMap() {
        for (let i = 0; i < scooterLocations.length; i++) {
            scooterLocations[i].remove();
        }
        if (!document.querySelector(".micromobility").checked) {
            // Hide loading overlay when checkbox is unchecked
            hideLoadingOverlay();
            return
        }

        let micromobility = document.querySelector(".micromobility").checked;

        // mobility JSON data
        if (micromobility) {
            // Show loading overlay
            showLoadingOverlay('Loading micromobility location data...');
            
            scooter_markers = new_scooter_cluster_layer();
            // Try direct fetch first, then fallback to CORS proxy if needed
            const scooterUrl = 'https://smartcity.tacc.utexas.edu/data/transportation/freebike.json';
            const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(scooterUrl);
            
            // Try direct fetch with explicit CORS mode
            fetch(scooterUrl, {
                mode: 'cors',
                credentials: 'omit'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json(); 
                })
                .catch(error => {
                    console.log('Direct fetch failed, trying CORS proxy:', error);
                    // Fallback to CORS proxy
                    return fetch(proxyUrl, {
                        mode: 'cors',
                        credentials: 'omit'
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Proxy fetch failed');
                        }
                        return response.json();
                    });
                })
                .then(scooter_json => {
                    console.log(scooter_json);
                    
                    // Hide loading overlay
                    hideLoadingOverlay();
                    
                    if (!scooter_json || !scooter_json["data"] || !scooter_json["data"]["bikes"]) {
                        console.error('Invalid scooter data format');
                        return;
                    }
                    
                    for (let i = 0; i < scooter_json["data"]["bikes"].length; i++) {
                        let y = scooter_json["data"]["bikes"][i]["lat"];
                        let x = scooter_json["data"]["bikes"][i]["lon"];
                        let scooter_marker = new L.marker([y,x]);
                        let iconLink = "assets/images/scooter_icon.png";
                        scooter_marker.setIcon(L.icon({
                            iconUrl: iconLink,
                            iconSize: [24, 32],
                            iconAnchor: [12, 32],
                            popupAnchor: [0, -30]
                        }));
                        var bike_id = scooter_json["data"]["bikes"][i]["bike_id"]
                        var bike_type = scooter_json["data"]["bikes"][i]["vehicle_type_id"]
                        scooter_marker.bindPopup(" ID: " + bike_id + ", Type: " + bike_type);
            
                        scooter_markers.addLayer(scooter_marker)
                        scooterLocations.addLayer(scooter_marker)
                    }
                    map.addLayer(scooter_markers)
                })
                .catch(error => {
                    console.error('Error fetching scooter data:', error);
                    // Hide loading overlay on error
                    hideLoadingOverlay();
                    alert('Failed to load micromobility location data. This may be due to CORS restrictions. Please contact the administrator.');
                });
        }
    }

    let incident_markers = []
    
    // Generic loading overlay functions
    function showLoadingOverlay(loadingText = 'Loading...') {
        const loadingOverlay = document.getElementById('data-loading-overlay');
        const progressBar = document.getElementById('loading-progress-bar');
        const percentageText = document.getElementById('loading-percentage');
        const textElement = document.getElementById('loading-text');
        
        if (loadingOverlay) {
            // Set loading text
            if (textElement) {
                textElement.textContent = loadingText;
            }
            
            loadingOverlay.style.display = 'flex';
            if (progressBar) {
                progressBar.style.width = '0%';
            }
            if (percentageText) {
                percentageText.textContent = '0%';
            }
            
            // Simulate progress animation
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 90) progress = 90; // Don't complete until actual data loads
                if (progressBar) {
                    progressBar.style.width = progress + '%';
                }
                if (percentageText) {
                    percentageText.textContent = Math.floor(progress) + '%';
                }
            }, 200);
            
            // Store interval ID for cleanup
            loadingOverlay.dataset.progressInterval = progressInterval;
        }
    }
    
    function hideLoadingOverlay() {
        const loadingOverlay = document.getElementById('data-loading-overlay');
        const progressBar = document.getElementById('loading-progress-bar');
        const percentageText = document.getElementById('loading-percentage');
        
        if (loadingOverlay) {
            // Complete the progress bar
            if (progressBar) {
                progressBar.style.width = '100%';
                progressBar.style.animation = 'none';
            }
            if (percentageText) {
                percentageText.textContent = '100%';
            }
            
            // Clear progress interval if exists
            if (loadingOverlay.dataset.progressInterval) {
                clearInterval(parseInt(loadingOverlay.dataset.progressInterval));
            }
            
            // Hide after a short delay to show completion
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
                if (progressBar) {
                    progressBar.style.width = '0%';
                    progressBar.style.animation = 'progress-animation 2s ease-in-out infinite';
                }
                if (percentageText) {
                    percentageText.textContent = '0%';
                }
            }, 300);
        }
    }

    function buildLiveIncidentMap() {
        // Delete all markers
        for (var i = 0; i < incident_markers.length; i++) {
            incident_markers[i].remove();
        }
        let incident = document.querySelector(".active_incident").checked;
        if (incident) {
            console.log("Active Incident checked")
            
            // Show loading overlay
            showLoadingOverlay('Loading traffic incident data...');
            
            // Try direct fetch first, then fallback to CORS proxy if needed
            const incidentUrl = 'https://smartcity.tacc.utexas.edu/data/transportation/incident_active.json';
            const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(incidentUrl);
            
            // Try direct fetch with explicit CORS mode
            fetch(incidentUrl, {
                mode: 'cors',
                credentials: 'omit'
            })
              .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
              })
              .catch(error => {
                console.log('Direct fetch failed, trying CORS proxy:', error);
                // Fallback to CORS proxy
                return fetch(proxyUrl, {
                    mode: 'cors',
                    credentials: 'omit'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Proxy fetch failed');
                    }
                    return response.json();
                });
              })
              .then(incident_json => {
                console.log(incident_json);
                
                // Hide loading overlay
                hideLoadingOverlay();
                
                if (!incident_json || !Array.isArray(incident_json)) {
                    console.error('Invalid incident data format');
                    return;
                }
                
                for (let i = 0; i < incident_json.length; i++) {
                    let y = incident_json[i]["Latitude"];
                    let x = incident_json[i]["Longitude"];
                    let incident_marker = new L.marker([y,x]).addTo(map);
                    let iconLink = "assets/images/active_incident_icon.png"
                    incident_marker.setIcon(L.icon({
                        iconUrl: iconLink,
                        iconSize: [22, 32],
                        iconAnchor: [11, 32],
                        popupAnchor: [0, -30]
                    }));
                    let issue = incident_json[i]["Issue Reported"];
                    let address = incident_json[i]["Address"];
                    let pub_time = incident_json[i]["time"];
                    let status = incident_json[i]["Status"];
                    incident_marker.bindPopup(" Issue: " + issue + ", Address: " + address + ", Time: " + pub_time + ", Status: " + status);
                    incident_markers.push(incident_marker);
                }
              })
              .catch(error => {
                console.error('Error fetching incident data:', error);
                // Hide loading overlay on error
                hideLoadingOverlay();
                alert('Failed to load active traffic incident data. This may be due to CORS restrictions. Please contact the administrator.');
              });
        } else {
            // Hide loading overlay when checkbox is unchecked
            hideLoadingOverlay();
        }
    }

    function buildArchivedIncidentMap() {
        for (let i = 0; i < incidentLocations.length; i++) {
            incidentLocations[i].remove();
        }
        if (!document.querySelector(".archived_incident").checked) {
            // Hide loading overlay when checkbox is unchecked
            hideLoadingOverlay();
            return
        }

        let archived_incident = document.querySelector(".archived_incident").checked;

        // mobility JSON data
        if (archived_incident) {
            // Show loading overlay
            showLoadingOverlay('Loading archived traffic incident data...');
            
            archived_incident_markers = new_archived_incident_cluster_layer();
            // Try direct fetch first, then fallback to CORS proxy if needed
            const archivedUrl = 'https://smartcity.tacc.utexas.edu/data/transportation/incident_archived.json';
            const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(archivedUrl);
            
            // Try direct fetch with explicit CORS mode
            fetch(archivedUrl, {
                mode: 'cors',
                credentials: 'omit'
            })
              .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
              })
              .catch(error => {
                console.log('Direct fetch failed, trying CORS proxy:', error);
                // Fallback to CORS proxy
                return fetch(proxyUrl, {
                    mode: 'cors',
                    credentials: 'omit'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Proxy fetch failed');
                    }
                    return response.json();
                });
              })
              .then(archived_incident_json => {
                console.log(archived_incident_json);
                
                // Hide loading overlay
                hideLoadingOverlay();
                
                if (!archived_incident_json || !Array.isArray(archived_incident_json)) {
                    console.error('Invalid archived incident data format');
                    return;
                }
                
                for (let i = 0; i < archived_incident_json.length; i++) {
                    let y = archived_incident_json[i]["Latitude"];
                    let x = archived_incident_json[i]["Longitude"];
                    let archived_incident_marker = new L.marker([y,x]);
                    let iconLink = "assets/images/archived_incident_icon.png"
                    archived_incident_marker.setIcon(L.icon({
                        iconUrl: iconLink,
                        iconSize: [22, 32],
                        iconAnchor: [11, 32],
                        popupAnchor: [0, -30]
                    }));
                    let issue = archived_incident_json[i]["Issue Reported"];
                    let address = archived_incident_json[i]["Address"];
                    let pub_time = archived_incident_json[i]["time"];
                    let status = archived_incident_json[i]["Status"];
                    archived_incident_marker.bindPopup(" Issue: " + issue + ", Address: " + address + ", Time: " + pub_time + ", Status: " + status);
                    
                    archived_incident_markers.addLayer(archived_incident_marker)
                    incidentLocations.addLayer(archived_incident_marker)
                }
                map.addLayer(archived_incident_markers)
            })
            .catch(error => {
                console.error('Error fetching archived incident data:', error);
                // Hide loading overlay on error
                hideLoadingOverlay();
                alert('Failed to load archived traffic incident data. This may be due to CORS restrictions. Please contact the administrator.');
            });
        }
    }

    let current_incident_shapefile = null
    function buildIncidentChoropleth() {
        if (current_incident_shapefile != null){
            map.removeLayer(current_incident_shapefile)
            current_incident_shapefile = null
        }
        if (!document.querySelector(".choropleth_incident").checked) {
            return
        }
        let shapefile_path = "data/incident_choropleth.zip";
        let popupContent = ``;
        function getColor(d) {
            return d > 5000 ? '#800026' :
                   d > 3000  ? '#BD0026' :
                   d > 2000  ? '#E31A1C' :
                   d > 1000  ? '#FC4E2A' :
                   d > 500   ? '#FD8D3C' :
                   d > 400   ? '#FEB24C' :
                   d > 300   ? '#FED976' :
                   d > 200   ? '#FFEDA0' :
                   d > 100   ? '#bbdb44' :
                              '#44ce1b';
        }
        let shpfile = new L.Shapefile(shapefile_path, {
            onEachFeature: function(feature,layer){
                popupContent = `
                <div class="basic-info">
                    <span>GEOID: ${feature.properties["GEOID"]}</span><BR>
                    <span>Land Area: ${feature.properties["ALAND"]} m&sup2 </span><BR>
                </div>
                <div class="stats-info">
                    <span>Incident Count (2017-2023): ${feature.properties["incident_c"]} </span><BR>
                    <span>Incident Count (2023): ${feature.properties["incident_1"]} </span><BR>
                    <span>Incident Count (2022): ${feature.properties["incident_2"]} </span><BR>
                    <span>Incident Count (2021): ${feature.properties["incident_3"]} </span><BR>
                </div>
                `;
                layer.bindPopup(popupContent);
                let count = Number(feature.properties["incident_c"]);
                layer.options.color = getColor(count)
                layer.options.weight = 0.5
                layer.options.fillOpacity = 0.65
            }
        })
        shpfile.addTo(map);
        current_incident_shapefile = shpfile;
    }

    let current_road_incident = null
    function buildRoadIncident() {
        if (current_road_incident != null){
            map.removeLayer(current_road_incident)
            current_road_incident = null
        }
        if (!document.querySelector(".road_incident").checked) {
            return
        }
        let shapefile_path = "data/road_incident.zip";
        let popupContent = ``;
        function getColor(d) {
            return d > 2000 ? '#800026' :
                   d > 1000  ? '#BD0026' :
                   d > 500  ? '#E31A1C' :
                   d > 300  ? '#FC4E2A' :
                   d > 200  ? '#FD8D3C' :
                   d > 100   ? '#FEB24C' :
                   d > 50   ? '#FED976' :
                   d > 10   ? '#FFEDA0' :
                   d > 0   ? '#bbdb44':
                              '#44ce1b';
        }
        let shpfile = new L.Shapefile(shapefile_path, {
            onEachFeature: function(feature,layer){
                let count = Number(feature.properties["count"]);
                if(count >= 10) {
                    popupContent = `
                    <div class="basic-info">
                        <span>ID: ${feature.properties["LINEARID"]}</span><BR>
                        <span>Name: ${feature.properties["FULLNAME"]} </span><BR>
                    </div>
                    <div class="stats-info">
                        <span>Incident Count: ${feature.properties["count"]} </span><BR>
                    </div>
                    `;
                }
                else {
                    popupContent = `
                    <div class="stats-info">
                        <span>Incident Count: ${feature.properties["count"]} </span><BR>
                    </div>
                    `;
                }
                layer.bindPopup(popupContent);
                layer.options.color = getColor(count)
                layer.options.weight = 2
            }
        })
        shpfile.addTo(map);
        current_road_incident = shpfile;
    }

    let current_traffic_layer = null;
    function builtTrafficMap() {
        if (current_traffic_layer != null) {
            map.removeLayer(current_traffic_layer)
            current_traffic_layer = null
        }
        if (!document.querySelector(".traffic_condition").checked) {
            return
        }
        let traffic_layer = L.gridLayer.googleMutant({
            type: "roadmap",
            styles: [
                { featureType: "all", stylers: [{ visibility: "off" }] },
            ],
        }).addTo(map);
        traffic_layer.addGoogleLayer("TrafficLayer");
        current_traffic_layer = traffic_layer
    }

    let current_walkscore_shapefile = null
    function buildWalkScoreMap() {
        if (current_walkscore_shapefile != null){
            map.removeLayer(current_walkscore_shapefile)
            current_walkscore_shapefile = null
        }
        if (!document.querySelector(".walk_score").checked) {
            return
        }
        let shapefile_path = "data/walkscore_bg.zip";
        let popupContent = ``;
        function getColor(d) {
            return d < 10 ? '#BD0026' :
                   d < 20  ? '#E31A1C' :
                   d < 30  ? '#FC4E2A' :
                   d < 40  ? '#FD8D3C' :
                   d < 50   ? '#FEB24C' :
                   d < 60   ? '#F8DE7E' :
                   d < 70   ? '#CDCA74' :
                   d < 80   ? '#A3B56B' :
                   d < 90   ? '#78A161' :
                              '#4D8C57';
        }
        let shpfile = new L.Shapefile(shapefile_path, {
            onEachFeature: function(feature,layer){
                popupContent = `
                <div class="basic-info">
                    <span>GEOID: ${feature.properties["GEOID"]}</span><BR>
                </div>
                <div class="stats-info">
                    <span>Walk Score: ${feature.properties["walkscore"]} </span><BR>
                    <span>Description: ${feature.properties["ws_label"]} </span><BR>
                </div>
                `;
                layer.bindPopup(popupContent);
                let score = Number(feature.properties["walkscore"]);
                if (isNaN(score)) {
                    score = 0
                }
                layer.options.color = getColor(score)
                layer.options.weight = 0.8
                layer.options.fillOpacity = 0.65
            }
        })
        shpfile.addTo(map);
        current_walkscore_shapefile = shpfile;
    }

    let current_bikescore_shapefile = null
    function buildBikeScoreMap() {
        if (current_bikescore_shapefile != null){
            map.removeLayer(current_bikescore_shapefile)
            current_bikescore_shapefile = null
        }
        if (!document.querySelector(".bike_score").checked) {
            return
        }
        let shapefile_path = "data/walkscore_bg.zip";
        let popupContent = ``;
        function getColor(d) {
            return d < 10 ? '#BD0026' :
                   d < 20  ? '#E31A1C' :
                   d < 30  ? '#FC4E2A' :
                   d < 40  ? '#FD8D3C' :
                   d < 50   ? '#FEB24C' :
                   d < 60   ? '#F8DE7E' :
                   d < 70   ? '#CDCA74' :
                   d < 80   ? '#A3B56B' :
                   d < 90   ? '#78A161' :
                              '#4D8C57';
        }
        let shpfile = new L.Shapefile(shapefile_path, {
            onEachFeature: function(feature,layer){
                let score = Number(feature.properties["bikescore"]);
                if (isNaN(score) || score < 0) {
                    score = 0
                }
                popupContent = `
                <div class="basic-info">
                    <span>GEOID: ${feature.properties["GEOID"]}</span><BR>
                </div>
                <div class="stats-info">
                    <span>Bike Score: ${score} </span><BR>
                    <span>Description: ${feature.properties["bs_label"]} </span><BR>
                </div>
                `;
                layer.bindPopup(popupContent);
                layer.options.color = getColor(score)
                layer.options.weight = 0.8
                layer.options.fillOpacity = 0.65
            }
        })
        shpfile.addTo(map);
        current_bikescore_shapefile = shpfile;
    }

    let current_transcore_shapefile = null
    function buildTransitScoreMap() {
        if (current_transcore_shapefile != null){
            map.removeLayer(current_transcore_shapefile)
            current_transcore_shapefile = null
        }
        if (!document.querySelector(".transit_score").checked) {
            return
        }
        let shapefile_path = "data/walkscore_bg.zip";
        let popupContent = ``;
        function getColor(d) {
            return d < 5 ? '#BD0026' :
                   d < 10  ? '#E31A1C' :
                   d < 15  ? '#FC4E2A' :
                   d < 20  ? '#FD8D3C' :
                   d < 30   ? '#FEB24C' :
                   d < 40   ? '#F8DE7E' :
                   d < 50   ? '#CDCA74' :
                   d < 60   ? '#A3B56B' :
                   d < 70   ? '#78A161' :
                              '#4D8C57';
        }
        let shpfile = new L.Shapefile(shapefile_path, {
            onEachFeature: function(feature,layer){
                let score = Number(feature.properties["transcore"]);
                if (isNaN(score) || score < 0) {
                    score = 0
                }
                popupContent = `
                <div class="basic-info">
                    <span>GEOID: ${feature.properties["GEOID"]}</span><BR>
                </div>
                <div class="stats-info">
                    <span>Transit Score: ${score} </span><BR>
                    <span>Description: ${feature.properties["ts_label"]} </span><BR>
                </div>
                `;
                layer.bindPopup(popupContent);
                layer.options.color = getColor(score)
                layer.options.weight = 0.8
                layer.options.fillOpacity = 0.65
            }
        })
        shpfile.addTo(map);
        current_transcore_shapefile = shpfile;
    }

    let current_transit_desert = null
    function buildTransitDesertMap() {
        if (current_transit_desert != null){
            map.removeLayer(current_transit_desert)
            current_transit_desert = null
        }
        if (!document.querySelector(".transit_desert").checked) {
            return
        }
        let shapefile_path = "data/transit_desert.zip";
        let popupContent = ``;
        function getColor(d) {
            return d < -1  ? '#E31A1C' :
                   d <= 0   ? '#F8DE7E' :
                   d < 1   ? '#CDCA74' :
                             '#4D8C57' ;
        }
        function getDescription(d) {
            return d < -1  ? 'Transit Desert' :
                   d <= 0   ? 'Properly Served' :
                   d < 1   ? 'Properly Served' :
                             'Transit Oasis' ;
        }
        let shpfile = new L.Shapefile(shapefile_path, {
            onEachFeature: function(feature,layer){
                let score = Number(feature.properties["td_index"]);
                if (isNaN(score)) {
                    score = 0
                }
                popupContent = `
                <div class="basic-info">
                    <span>GEOID: ${feature.properties["GEOID"]}</span><BR>
                </div>
                <div class="stats-info">
                    <span>Transit Desert Index: ${score} </span><BR>
                    <span>Description: ${getDescription(score)} </span><BR>
                </div>
                `;
                layer.bindPopup(popupContent);
                layer.options.color = getColor(score)
                layer.options.weight = 0.8
                layer.options.fillOpacity = 0.65
            }
        })
        shpfile.addTo(map);
        current_transit_desert = shpfile;
    }

    let current_transit_desert_v1 = null
    function buildTransitDesertMap_v1() {
        if (current_transit_desert_v1 != null){
            map.removeLayer(current_transit_desert_v1)
            current_transit_desert_v1 = null
        }
        if (!document.querySelector(".transit_desert_v1").checked) {
            return
        }
        let shapefile_path = "data/transit_desert_v1.zip";
        let popupContent = ``;
        function getColor(d) {
            return d < -1  ? '#E31A1C' :
                   d <= 0   ? '#F8DE7E' :
                   d < 1   ? '#CDCA74' :
                             '#4D8C57' ;
        }
        function getDescription(d) {
            return d < -1  ? 'Transit Desert' :
                   d <= 0   ? 'Properly Served' :
                   d < 1   ? 'Properly Served' :
                             'Transit Oasis' ;
        }
        let shpfile = new L.Shapefile(shapefile_path, {
            onEachFeature: function(feature,layer){
                let score = Number(feature.properties["Gap_Zscore"]);
                if (isNaN(score)) {
                    score = 0
                }
                popupContent = `
                <div class="basic-info">
                    <span>GEOID: ${feature.properties["GEOID"]}</span><BR>
                </div>
                <div class="stats-info">
                    <span>Transit Desert Index: ${score} </span><BR>
                    <span>Description: ${getDescription(score)} </span><BR>
                </div>
                `;
                layer.bindPopup(popupContent);
                layer.options.color = getColor(score)
                layer.options.weight = 0.8
                layer.options.fillOpacity = 0.65
            }
        })
        shpfile.addTo(map);
        current_transit_desert_v1 = shpfile;
    }

    let current_bicycle_facility = null
    function buildBicycleFacility() {
        if (current_bicycle_facility != null){
            map.removeLayer(current_bicycle_facility)
            current_bicycle_facility = null
        }
        if (!document.querySelector(".bicycle_facilities").checked) {
            return
        }
        let shapefile_path = "data/bicycle_facilities.zip";
        let popupContent = ``;
        let shpfile = new L.Shapefile(shapefile_path, {
            onEachFeature: function(feature,layer){
                popupContent = `
                <div class="basic-info">
                    <span>ID: ${feature.properties["objectid"]}</span><BR>
                    <span>Street: ${feature.properties["full_stree"]}</span><BR>
                    <span>Type: ${feature.properties["line_type"]}</span><BR>
                    <span>Level: ${feature.properties["bike_level"]}</span><BR>
                </div>
                `;
                layer.bindPopup(popupContent);
                layer.options.color = "#6C3483"
                layer.options.weight = 1.5
            }
        })
        shpfile.addTo(map);
        console.log(shpfile);
        current_bicycle_facility = shpfile;
    }

    let current_city_corridor = null
    function buildCityCorridor() {
        if (current_city_corridor != null){
            map.removeLayer(current_city_corridor)
            current_city_corridor = null
        }
        if (!document.querySelector(".city_corridor").checked) {
            return
        }
        let shapefile_path = "data/major_city_corridors.zip";
        let popupContent = ``;
        let shpfile = new L.Shapefile(shapefile_path, {
            onEachFeature: function(feature,layer){
                popupContent = `
                <div class="basic-info">
                    <span>Name: ${feature.properties["name"]}</span><BR>
                    <span>Length: ${feature.properties["length"]} mile</span><BR>
                </div>
                `;
                layer.bindPopup(popupContent);
                layer.options.color = "#34495E"
                layer.options.weight = 4
            }
        })
        shpfile.addTo(map);
        console.log(shpfile)
        current_city_corridor = shpfile;
    }


    function buildDropdownMenu(map) {
        var checkList = document.getElementById('filter-menu');
        var overlay = document.getElementById('filter-menu-overlay');
        
        // 切换菜单显示/隐藏
        function toggleMenu() {
            if (checkList.classList.contains('visible')) {
                checkList.classList.remove('visible');
                if (overlay) overlay.classList.remove('show');
            } else {
                checkList.classList.add('visible');
                if (overlay) overlay.classList.add('show');
            }
        }
        
        // 点击锚点切换菜单
        checkList.getElementsByClassName('anchor')[0].onclick = function (evt) {
            evt.stopPropagation();
            toggleMenu();
        }
        
        // 点击遮罩层关闭菜单
        if (overlay) {
            overlay.onclick = function (evt) {
                evt.stopPropagation();
                checkList.classList.remove('visible');
                overlay.classList.remove('show');
            }
        }
        
        // 点击菜单内部时阻止事件冒泡
        var items = checkList.getElementsByClassName('items')[0];
        if (items) {
            items.onclick = function (evt) {
                evt.stopPropagation();
            }
        }
        
        // 点击关闭按钮关闭菜单
        var closeBtn = checkList.querySelector('.sidebar-close');
        if (closeBtn) {
            closeBtn.onclick = function (evt) {
                evt.stopPropagation();
                checkList.classList.remove('visible');
                if (overlay) overlay.classList.remove('show');
            }
        }
        // add event listener
        document.querySelector(".firedept").addEventListener('click', function () {
            buildPOIMap();
        });

        document.querySelector(".policedept").addEventListener('click', function () {
            buildPOIMap();
        });

        document.querySelector(".hospital").addEventListener('click', function () {
            buildPOIMap();
        });

        document.querySelector(".transit").addEventListener('click', function () {
            // buildTranMap();
            console.log("transit click")
            map.removeLayer(transit_markers)
            buildTranMap();
        });

        document.querySelector(".micromobility").addEventListener('click', function () {
            // buildScooterMap();
            console.log("micromobility click")
            map.removeLayer(scooter_markers)
            buildScooterMap();
        });

        document.querySelector(".active_incident").addEventListener('click', function () {
            buildLiveIncidentMap();
        });
        document.querySelector(".archived_incident").addEventListener('click', function () {
            // console.log("archived incident click")
            map.removeLayer(archived_incident_markers)
            buildArchivedIncidentMap();
        });
        document.querySelector(".choropleth_incident").addEventListener('click', function () {
            console.log('choropleth_incident click')
            buildIncidentChoropleth();
        });
        document.querySelector(".road_incident").addEventListener('click', function () {
            console.log('road_incident click')
            buildRoadIncident();
        });
        document.querySelector(".traffic_condition").addEventListener('click', function () {
            builtTrafficMap();
        });
        document.querySelector(".walk_score").addEventListener('click', function () {
            console.log('walk_score click')
            buildWalkScoreMap();
        });
        document.querySelector(".bike_score").addEventListener('click', function () {
            console.log('bike_score click')
            buildBikeScoreMap();
        });
        document.querySelector(".transit_score").addEventListener('click', function () {
            console.log('transit_score click')
            buildTransitScoreMap();
        });
        document.querySelector(".transit_desert").addEventListener('click', function () {
            console.log('transit_desert click')
            buildTransitDesertMap();
        });
        document.querySelector(".transit_desert_v1").addEventListener('click', function () {
            console.log('transit_desert_v1 click')
            buildTransitDesertMap_v1();
        });
        document.querySelector(".bicycle_facilities").addEventListener('click', function () {
            console.log('bicycle_facilities click')
            buildBicycleFacility();
        });
        document.querySelector(".city_corridor").addEventListener('click', function () {
            console.log('city_corridor click')
            buildCityCorridor();
        });


        // Initialize default checked checkboxes on page load
        // Mapping of checkbox class names to their corresponding build functions
        const checkboxBuildMap = {
            'firedept': buildPOIMap,
            'policedept': buildPOIMap,
            'hospital': buildPOIMap,
            'transit': buildTranMap,
            'micromobility': buildScooterMap,
            'active_incident': buildLiveIncidentMap,
            'archived_incident': buildArchivedIncidentMap,
            'choropleth_incident': buildIncidentChoropleth,
            'road_incident': buildRoadIncident,
            'traffic_condition': builtTrafficMap,
            'walk_score': buildWalkScoreMap,
            'bike_score': buildBikeScoreMap,
            'transit_score': buildTransitScoreMap,
            'transit_desert': buildTransitDesertMap,
            'transit_desert_v1': buildTransitDesertMap_v1,
            'bicycle_facilities': buildBicycleFacility,
            'city_corridor': buildCityCorridor
        };

        // Automatically trigger build functions for all checked checkboxes
        Object.keys(checkboxBuildMap).forEach(function(className) {
            const checkbox = document.querySelector('.' + className);
            if (checkbox && checkbox.checked) {
                checkboxBuildMap[className]();
            }
        });
    }



    var data = "<item><title>Traffic Injury Pri 4F</title>" +
        "<link>http://maps.google.com/maps?q=30.389258,-97.745772</link>" +
        "<description>9800-9832 RESEARCH BLVD SVRD SB | AFD | 16:12:50</description>" +
        "<pubDate>Mon, 06 Dec 2021 16:12:50 CDT</pubDate></item>";

    // initialize map and base layer
    var map = L.map('map',{ preferCanvas:true, zoomControl: false, renderer: L.canvas() }).setView([30.356635, -97.701180], 12);

    new L.Control.Zoom({ position: 'bottomright' }).addTo(map);

    let inactive_flag = false;
    let purple_air_diaplay_flag = false;
    let microsoft_air_display_flag = false;

    addMapLayer(map);

    // map today's dp
    let dateArray = [];
    var airData = [];
    var today = new Date();
    var date = today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + ("0" + today.getDate()).slice(-2);
    dateArray.push(date);
    buildDropdownMenu(map);
    map._layersMaxZoom = 19;





    // add geolocator for address
    //const provider = new GeoSearch.OpenStreetMapProvider();

    //const search = new GeoSearch.GeoSearchControl({
    //    provider: new GeoSearch.OpenStreetMapProvider(),
    //});
    //map.addControl(search);

    // create the geocoding control and add it to the map
    var searchControl = L.esri.Geocoding.geosearch({
        position: 'topright',
        placeholder: 'Enter an address or place e.g. 1 York St',
        providers: [
        L.esri.Geocoding.arcgisOnlineProvider({
            // API Key to be passed to the ArcGIS Online Geocoding Service
            apikey: 'AAPK88fbee9b41364fc28314cabcb5108702X4OOHT6TEoflnY2xPNIuDPA8zi_zSGHg0weTJJzjiOFWugapHwRA5DvZw7Uht0eR'
        })
        ]
    }).addTo(map);


    //document.getElementsByClassName("geocoder-control")[0].children[0].style = "background-color: transparent; border-color: transparent; background-image:url(assets/images/search.png);"
    //document.getElementsByClassName("geocoder-control")[0].style = "position: fixed;top: 2.5px;right: -4.5px;"

    console.log(searchControl)

    // create an empty layer group to store the results and add it to the map
    var results = L.layerGroup().addTo(map);

    // listen for the results event and add every result to the map
    searchControl.on("results", function (data) {
        foundLocationGeocoded(data);
    });

    // Get user location and display on map


  L.Control.Watermark = L.Control.extend({
    onAdd: function (map) {
        var container = L.DomUtil.create('div');
        container.type="button";
        container.title="No cat";
        container.value = "42";
        container.classList = ["geocoder-control leaflet-control"]
    
        /*container.style.backgroundColor = 'white';     
        //container.style.backgroundImage = "url(https://t1.gstatic.com/images?q=tbn:ANd9GcR6FCUMW5bPn8C4PbKak2BJQQsmC-K9-mbYBeFZm1ZM2w2GRy40Ew)";
        container.style.backgroundSize = "30px 30px";
        container.style.width = '30px';
        container.style.height = '30px'; 
        
        container.onmouseover = function(){
          container.style.backgroundColor = 'pink'; 
        }
        container.onmouseout = function(){
          container.style.backgroundColor = 'white'; 
        } */
    
        container.onclick = function(){
          getUserLocation();
        }
    
        container.innerHTML = `
        <div class=\"geocoder-control-input leaflet-bar\" title=\"Check My Location\" style=\"position:absolute;top:0px; background-image: url(https://smartcity.tacc.utexas.edu/FireIncident/assets/images/location.png)\"></div><div class=\"geocoder-control-suggestions leaflet-bar\"><div class=\"\"></div></div>\r\n
        `;

        return container;
      },

    onRemove: function(map) {
        // Nothing to do here
    }
});

L.control.watermark = function(opts) {
    return new L.Control.Watermark(opts);
}

L.control.watermark({ position: 'bottomright' }).addTo(map);

L.Control.Watermark = L.Control.extend({
    onAdd: function (map) {
        var container = L.DomUtil.create('div');
        container.type="button";
        container.title="No cat";
        container.value = "42";
        container.classList = ["geocoder-control leaflet-control"]
    
        container.innerHTML = `
        <div class=\"dropdown-check-list geocoder-control-input leaflet-bar\" title=\"Layers\" style=\"    background-color: transparent;
        border-color: transparent; background-image: url(); width:35px; \"><img src="assets/images/layers.png" style="width: 20px;height: 20px;position: absolute;left: 5px;"></div><div class=\"geocoder-control-suggestions leaflet-bar\"><div class=\"\"></div></div>\r\n
        `;

        return container;
      },

    onRemove: function(map) {
        // Nothing to do here
    }
});

L.control.watermark = function(opts) {
    return new L.Control.Watermark(opts);
}


L.control.watermark({ position: 'bottomright' }).addTo(map);

    var spinner = document.getElementById('spinner');
    spinner.style.display = 'none';

    document.getElementsByClassName( 'leaflet-control-attribution' )[0].style.display = 'none';
