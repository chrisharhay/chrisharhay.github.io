function initMap() {
	console.log("Init Map")

    var icons = {
      busIcons: {icon:'bus-side-view.png'}
    }
    
	var mapOptions = {
        center: new google.maps.LatLng(41.7637,-72.6851),
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
	
   	var map = new google.maps.Map(document.getElementById('map'), mapOptions);
	
	/////////////////////////////////////////////////////////////
	// AutoComplete Search Box
	var acOptions = {
      types: ['establishment']
    };
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'),acOptions);
    autocomplete.bindTo('bounds',map);
	
	var infoWindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map
    });
	
	google.maps.event.addListener(autocomplete, 'place_changed', function() {
		infoWindow.close();
		var place = autocomplete.getPlace();
		if (place.geometry.viewport) {
		map.fitBounds(place.geometry.viewport);
		} else {
		map.setCenter(place.geometry.location);
		map.setZoom(17);
		}
		marker.setPosition(place.geometry.location);
		infoWindow.setContent('<div><strong>' + place.name + '</strong><br>');
		infoWindow.open(map, marker);
		google.maps.event.addListener(marker,'click',function(e){
		infoWindow.open(map, marker);
		});
    }); 
	// END of AutoComplete Search Box
	/////////////////////////////////////////////////////////////
	
	// Testing //
    var shapeCoords = [
    {lat: 41.764092,lng: -72.673866},
    {lat: 41.765766,lng: -72.673357},
    {lat: 41.765968,lng: -72.673294},
    {lat: 41.766371,lng: -72.673177},
    {lat: 41.766467,lng: -72.673165}
    ];
	
    var routePosition = {lat: 41.764092, lng: -72.673866};

    var routePath = new google.maps.Polyline({
          path: shapeCoords,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 4,
		  position: routePosition
        });

    routePath.setMap(map);

    var routeInfoWindowOptions = {
        content: 'Route Schedule!'
    };
    
    var routeInfoWindow = new google.maps.InfoWindow(routeInfoWindowOptions);
    google.maps.event.addListener(routePath,'click',function(e){
      routeInfoWindow.open(map, routePath);
    });
	// END Testing //
		
	// Pull and parse the real-time vehicle location information
    var busLocationsRaw = $.getJSON( "http://65.213.12.244/realtimefeed/vehicle/vehiclepositions.json", function() {
    // Would prefer to pull this data locally while testing, but can't get it to work //var busLocationsRaw = $.getJSON("googlha_transit/vehiclepositions.json", function() {
  
    busLocationsParse = JSON.parse(busLocationsRaw.responseText)
	
	var busLocationsArray = [];
	
	// Push all the vehicle data to an array of Vehicle objects.
    for (bus in busLocationsParse["entity"]){
		busLocationsArray.push(new Vehicle(
				busLocationsParse["entity"][bus]["id"], 
				busLocationsParse["entity"][bus]["vehicle"]["position"]["latitude"], 
				busLocationsParse["entity"][bus]["vehicle"]["position"]["longitude"], 
				busLocationsParse["entity"][bus]["vehicle"]["trip"]["route_id"],
				busLocationsParse["entity"][bus]["alert"],
				busLocationsParse["entity"][bus]["trip_update"],
				busLocationsParse["entity"][bus]["vehicle"]["trip"]["schedule_relationship"],
				busLocationsParse["entity"][bus]["vehicle"]["trip"]["start_date"],
				busLocationsParse["entity"][bus]["vehicle"]["trip"]["trip_id"],
				busLocationsParse["entity"][bus]["vehicle"]["label"],
				busLocationsParse["entity"][bus]["vehicle"]["id"]
				));
    }
		
	var busMarker;
	var busInfoWindow = new google.maps.InfoWindow();
	
	// Draw all the vehicles on the map, and create pop-up windows for each.
	for (var i=0; i<busLocationsArray.length; i++) {  
		console.log(busLocationsArray[i])
		
		busMarker = new google.maps.Marker({
						position: new google.maps.LatLng(busLocationsArray[i].latitude, busLocationsArray[i].longitude),
						icon: icons["busIcons"].icon,
						map: map
						});
	   	
		google.maps.event.addListener(busMarker, 'click', (function(busMarker, i) {
           return function() {
             busInfoWindow.setContent(
			 			'<div class="busID">'
			 			+busLocationsArray[i].id
						+'</div>'
						+'Alert: '+busLocationsArray[i].alert+'<br>'
						+'Route_ID: '+busLocationsArray[i].route_id+'<br>'
						+'Trip_ID: '+busLocationsArray[i].trip_id
						);
             busInfoWindow.open(map, busMarker);
         	 }
    	 	 })(busMarker, i));
	} // end for loop
	
  }); // end JSON function for busLocationsRaw

	handleFiles();
	/*
	$(document).ready(function() {
		$.ajax({
			type: "GET",
			url: "googleha_transit\shapes_smalltest.txt",
			dataType: "csv",
			success: function(data) {processData(data);}
		 });
	});
	*/
	
	
}; // end function initMap()


function Vehicle(
		 id, 
		 latitude, 
		 longitude, 
		 route_id,
		 alert,
		 trip_update,
		 schedule_relationship,
		 start_date,
		 trip_id,
		 label,
		 vehicle_id
		 ) {
	this.id = id;
	this.latitude = latitude;
	this.longitude = longitude;
	this.route_id = route_id;
	this.alert = alert;
	this.trip_update = trip_update;
	this.schedule_relationship = schedule_relationship;
	this.start_date = start_date;
	this.trip_id = trip_id;
	this.label = label;
	this.vehicle_id = vehicle_id;
};


function getRoutes() {
  var routeShapes = $.getJSON("googlha_transit/shapes.txt")
  var routes = $.getJSON("googlha_transit/routes.txt")
};


function handleFiles() {
	console.log("handleFiles");
	$(document).ready(function() {
		$.ajax({
			type: "GET",
			url: "googleha_transit\shapes_smalltest.txt",
			dataType: "csv",
			success: function(data) {processData(data);}
		 });
	});
};

function processData(allText) {
	console.log("processData");
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = [];

    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {

            var tarr = [];
            for (var j=0; j<headers.length; j++) {
                tarr.push(headers[j]+":"+data[j]);
            }
            lines.push(tarr);
        }
    }
    console.log(lines);
	return lines;
}
/**/
