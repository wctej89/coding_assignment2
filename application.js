var geocoder;
var map;

function initialize() {
  geocoder = new google.maps.Geocoder();
  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(-34.397, 150.644),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
}

function loadScript() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "http://maps.google.com/maps/api/js?sensor=false&callback=initialize";
  document.body.appendChild(script);
}

function codeAddress() {
    var address = document.getElementById("address").value;
    geocoder.geocode( { 'address': address}, function(results, status) {
      var north = results[0].geometry.viewport.ea.d; 
      var south = results[0].geometry.viewport.ea.b;
      var east = results[0].geometry.viewport.ia.d;
      var west = results[0].geometry.viewport.ia.b;

      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }

      findEarthquakes(north, south, east, west);
    });
}


function findEarthquakes(n,s,e,w) {
  document.getElementById("address").value
  $.ajax({
    url: "http://api.geonames.org/earthquakesJSON?north="+n+"&south="+s+"&east="+e+"&west="+w+"&username=wctej89"
  }).success(function(response) {
    earthquakesArray = response.earthquakes;
    drop();
  })
}

function drop() {
  for (var i = 0; i < earthquakesArray.length; i++) {
    setTimeout(function() {
      addMarker();
    }, i * 200);
  }
  counter = 0;
}

function addMarker() {
  var quakeLocation = new google.maps.LatLng(earthquakesArray[counter].lat,earthquakesArray[counter].lng)
  var marker = new google.maps.Marker({
    map: map,
    animation: google.maps.Animation.DROP,
    draggable: false,
    position: quakeLocation
  });
  var contentString = earthquakesArray[counter].datetime;
  var infowindow = new google.maps.InfoWindow({
    content: contentString
  });

  google.maps.event.addListener(marker, 'click', function() {
    $('.gm-style-iw').parent().remove()
    infowindow.open(map,marker);
  });
  counter++;
}

window.onload = loadScript;