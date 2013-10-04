var map;

function initialize() {
  var mapOptions = {
    zoom: 4,
    center: new google.maps.LatLng(37.6889, -97.3361),
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

//Finds 300 of the largest earthquakes
function customQuery() {
  funFacts();
  $.ajax({
    url: "http://api.geonames.org/earthquakesJSON?north=90&south=-90&east=180&west=-180&maxRows=300&username=wctej89"
  }).success( function(response) {
    var mapOptions = {
      zoom: 2,
      center: new google.maps.LatLng(2.8800, 23.6560),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    findDate(response.earthquakes);
  })
}

//Finds 10 of the largest earthquakes in the last year
function findDate(quakeArray) {
  var range = []
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1;
  var yyyy = today.getFullYear() - 1
  var lastYear = yyyy+"-"+mm+"-"+dd;
  
  quakeArray.forEach( function(i) {
    if(i.datetime > lastYear) {
      range.push(i);
    }
  })
  earthquakesArray = range.slice(0,10);
  drop();
}

//takes location input and retrieves coordinates for box
function codeAddress() {
    var address = document.getElementById("searchbox").value;
    var geocoder = new google.maps.Geocoder();
    var mapOptions = {
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        var box = results[0].geometry.bounds
        var keys = Object.keys(results[0].geometry.bounds)
        var north = box[keys[0]].d
        var south = box[keys[0]].b
        var east = box[keys[1]].d
        var west = box[keys[1]].b
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }

      findEarthquakes(north, south, east, west);
    });
}

//finds earthquakes based on location
function findEarthquakes(n,s,e,w) {
  $.ajax({
    url: "http://api.geonames.org/earthquakesJSON?north="+n+"&south="+s+"&east="+e+"&west="+w+"&username=wctej89"
  }).success(function(response) {
    if(response.earthquakes.length == 0) return alert("No earthquakes found")
    earthquakesArray = response.earthquakes;
    drop();
  })
}

//pin drop animation timer
function drop() {
  for (var i = 0; i < earthquakesArray.length; i++) {
    setTimeout(function() {
      addMarker();
    }, i * 200);
  }
  counter = 0;
}

function addMarker() {
  var quake = earthquakesArray[counter]
  var quakeLocation = new google.maps.LatLng(quake.lat,quake.lng)

  var marker = new google.maps.Marker({
    map: map,
    animation: google.maps.Animation.DROP,
    draggable: false,
    position: quakeLocation
  });
  addInfoWindow(marker,quake);
  counter++;
}

function addInfoWindow(marker,quake) {
  var contentString = "<p style='margin-bottom: 0;'>Date: " + quake.datetime + "</p>" + "<p style='margin-top: 0; margin-bottom: 0;'>Magnitude: " + quake.magnitude + "</p>";
  var infowindow = new google.maps.InfoWindow({
    content: contentString
  });

  google.maps.event.addListener(marker, 'click', function() {
    $('.gm-style-iw').parent().remove() 
    infowindow.open(map,marker);
  });
}

function funFacts() {
  var facts = ["Earth has been more seismologically active in the past 15 years or so, says Stephen S. Gao, a geophysicist at Missouri University of Science & Technology. Not all seismologist agree, however.", "San Francisco is moving toward Los Angeles at the rate of about 2 inches per year — the same pace as the growth of your fingernails — as the two sides of the San Andreas fault slip past one another. The cities will meet in several million years. However, this north-south movement also means that despite fears, California won't fall into the sea.", "There are about 500,000 earthquakes a year around the world, as detected by sensitive instruments. About 100,000 of those can be felt, and 100 or so cause damage each year. Each year the southern California area alone experiences about 10,000 earthquakes, most of them not felt by people.", "The sun and moon cause tremors. It's long been known that they create tides in the planet's crust, very minor versions of ocean tides. Now researchers say the tug of the sun and moon on the San Andreas Fault stimulates tremors deep underground.", "A city in Chile moved 10 feet in the massive 8.8 magnitude earthquake Feb. 27, 2010. The rip in Earth's crust shifted the city of Concepción that much to the west. The quake is also thought to have changed the planet's rotation slightly and shortened Earth's day.", "The Pacific Ring of Fire is the most geologically active region of Earth. It circles the Pacific Ocean, touching the coasts North and South America, Japan, China and Russia. It's where the majority of Earth's major quakes occur as major plate boundaries collide.", "Oil extraction can cause minor earthquakes. These are not the quakes you read about. Rather, because oil generally is found in soft and squishy sediment, when oil is removed other rock moves in to fill the void, creating 'mini-seismic events' that are not noticeable to humans.", "The largest earthquake ever recorded was a magnitude 9.5 in Chile on May 22, 1960.", "The deadliest earthquake ever struck January 23, 1556 in Shansi, China. Some 830,000 are estimated to have died."]
  var i = Math.floor(Math.random()*facts.length);
  $('#fact').html(facts[i]);
}

window.onload = loadScript;

$(document).ready(function() {
  $('form').on('submit', function(e) {e.preventDefault(); funFacts();});
  funFacts();
})