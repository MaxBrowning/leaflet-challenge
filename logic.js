// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function getColor(d) {
  return d >= 70 ? '#007dff' :
         d >= 50 ? '#1b904f' :
         d >= 30 ? '#f4ba48' :
         d >= 10 ? '#ec8a2e' :
                  '#a0353a';
};

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each layer a popup
  function onEachFeature(feature, layer) {
    layer.bindPopup("<p>Magnitude: " + feature.properties.mag + "</p><p>" + feature.properties.place + "</p><p>Depth: " + feature.geometry.coordinates[2] + "</p>");
  };

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Make markers be circles
  // Update style for each circle with radius corresponding to magnitude and color corresponding to depth
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng)
    },
    style: function (feature) {
      return {
        radius: feature.properties.mag * 4,
        color: "white",
        fillColor: getColor(feature.geometry.coordinates[2]),
        weight: 1,
        fillOpacity: 0.8,
      }
    },
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      15.5994, -28.6731
    ],
    zoom: 3,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


// Create a legend to display information about our map
var legend = L.control({
  position: "bottomright"
});

// When the layer control is added, insert a div with the class of "legend"
legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "info legend"),
    depths = ['-10', '10', '30', '50', '70'],
    labels = [];

  div.innerHTML += '<h4>EQ Depth</h4>'

  // loop through intervals to create a label with colored square
  for (var i = 0; i < depths.length; i++) {
    div.innerHTML +=
        '<i style="background:' + getColor(depths[i]) + '"></i> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
  }

  return div;
};

// Add the info legend to the map
legend.addTo(myMap);
}