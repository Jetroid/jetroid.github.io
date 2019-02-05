var processtrips = function() {
  var arcs = [];

  var previousLalo = undefined;
  var lalo = undefined;
  var transportMethod = "not specified";
  var to = "";

  var sameLalo = function(lalo1, lalo2) {
    return lalo1[0] === lalo2[0] && lalo1[1] === lalo2[1];
  }

  var isArc = function(lalo1, lalo2) {
    if (lalo1 === undefined || lalo1.length === 0) return false;
    if (lalo2 === undefined || lalo2.length === 0) return false;
    return !sameLalo(lalo1, lalo2);
  };

  var processArc = function() {
    if (isArc(previousLalo, lalo)){
      arcs.push({start: previousLalo, stop: lalo, transport: transportMethod, intensity: 10, to: to});
    }
    previousLalo = lalo;
    transportMethod = "not specified";
  };

  for (var i = 0; i < trips.length; i++) {
    var trip = trips[i];
    lalo = trip.arrivalLocation;
    transportMethod = trip.arrivalTransport;
    to = trip.name;
    processArc();
    lalo = trip.location;
    processArc();
    lalo = trip.departedLocation;
    processArc();
  }

  var isSameArc = function(arc1, arc2) {
    var start1 = arc1.start;
    var start2 = arc2.start;
    var stop1 = arc1.stop;
    var stop2 = arc2.stop;
    return (sameLalo(start1,start2) && sameLalo(stop1,stop2)) 
    || (sameLalo(start1,stop2) && sameLalo(stop1,start2));
  }

  // Arcs in `arcs` will be sorted so that the most recent is last.
  // If we pop them in order, and iterate descending,
  // then we always get the most recent arcs first in quantified arcs
  var quantifiedArcs = [];
  while (arcs.length > 0) {
    var arc = arcs.pop();
    var i = arcs.length;
    while (i--) {
      var comparisonArc = arcs[i];
      if (isSameArc(arc,comparisonArc)) { 
        arcs.splice(i, 1);
        arc.intensity += 1;
        if(arc.transport === "not specified") {
          arc.transport = comparisonArc.transport;
        }
      } 
    }
    quantifiedArcs.push(arc);
  }

  return quantifiedArcs;
}

/* Returns distance in KM */
var surfaceDistance = function(lalo1, lalo2) {
  var startPoint = Cesium.Cartographic.fromDegrees(lalo1[0], lalo1[1]);
  var endPoint = Cesium.Cartographic.fromDegrees(lalo2[0], lalo2[1]);

  var ellipsoidGeodesic = new Cesium.EllipsoidGeodesic(startPoint, endPoint);
  var distance = ellipsoidGeodesic.surfaceDistance * 0.001;
  return distance;
};


Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNDk4NTEzNi00OGQzLTRmMTMtOTk0Mi1jOTBmMTk0MzQxODQiLCJpZCI6NzIwNiwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0ODY2ODE0OH0.si4Hm0cwgNn1CcIltG9jsKp_DfbqXi6UnY4eVdCDqOM';
var viewer = new Cesium.Viewer('cesiumContainer', {
  navigationInstructionsInitiallyVisible: false,
  imageryProvider: new Cesium.IonImageryProvider({ assetId: 3812 }),
  animation: false,
  homeButton: false,
  fullscreenButton: false,
  navigationHelpButton: false,
  timeline: false,
  baseLayerPicker : false,
  geocoder : false,
  infoBox : false,
  skyAtmosphere: false,
  requestRenderMode : true
});
var layer = viewer.imageryLayers.addImageryProvider(
    new Cesium.IonImageryProvider({ assetId: 3812 })
);

viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;

var startTime = viewer.clock.startTime;
var midTime = Cesium.JulianDate.addSeconds(startTime, 43200, new Cesium.JulianDate());
var stopTime = Cesium.JulianDate.addSeconds(startTime, 86400, new Cesium.JulianDate());
var realTripsDisplay = new Cesium.DistanceDisplayCondition();
var arcs = processtrips();
for (var i = 0; i < arcs.length; i++) {
    var arc = arcs[i];
    var startLat = arc.start[0];
    var startLon = arc.start[1];
    var stopLat = arc.stop[0];
    var stopLon = arc.stop[1];
    var transportMethod = arc.transport;
    var intensity = arc.intensity + 1;
    var color = null;
    var height = 25000;
    var displayCondition = realTripsDisplay;
    if(transportMethod === "not specified") {
      color = Cesium.Color.BLACK;
      displayCondition = new Cesium.DistanceDisplayCondition(0.0, 86086.0*surfaceDistance(arc.start, arc.stop)-330434.0);
    } else if (transportMethod === "air") {
      color = Cesium.Color.CORAL;
      height += 500000;
    } else if (transportMethod === "boat") {
      color = Cesium.Color.CORNFLOWERBLUE;
    } else if (transportMethod === "car") {
      color = Cesium.Color.DARKSLATEGREY;
    } else if (transportMethod === "train") {
      color = Cesium.Color.DARKSEAGREEN;
    } else {
      color = Cesium.Color.BISQUE;
    }

    // Create a straight-line path.
    var property = new Cesium.SampledPositionProperty();
    var startPosition = Cesium.Cartesian3.fromDegrees(startLon, startLat, 0);
    property.addSample(startTime, startPosition);
    var stopPosition = Cesium.Cartesian3.fromDegrees(stopLon, stopLat, 0);
    property.addSample(stopTime, stopPosition);

    // Find the midpoint of the straight path, and raise its altitude.
    var midPoint = Cesium.Cartographic.fromCartesian(property.getValue(midTime));
    if (surfaceDistance(arc.start, arc.stop) < 30.0) {
      midPoint.height = height/25;
    } else {
      midPoint.height = height;
    }
    var midPosition = viewer.scene.globe.ellipsoid.cartographicToCartesian(
        midPoint, new Cesium.Cartesian3());

    // Redo the path to be the new arc.
    property = new Cesium.SampledPositionProperty();
    property.addSample(startTime, startPosition);
    property.addSample(midTime, midPosition);
    property.addSample(stopTime, stopPosition);

    // Create an Entity to show the arc.
    var point = {
        pixelSize : 8,
        color : Cesium.Color.TRANSPARENT,
        outlineColor : color,
        outlineWidth : 3
    };
    var arcEntity = viewer.entities.add({
        position : property,
        // The point is optional, I just wanted to see it.
        //point : point,
        path : {
            resolution : 1200,
            material : new Cesium.PolylineGlowMaterialProperty({
                glowPower : 0.24,
                color : color
            }),
            width : intensity,
            leadTime: 1e10,
            trailTime: 1e10,
            distanceDisplayCondition: displayCondition
        }
    });

    arcEntity.position.setInterpolationOptions({
        interpolationDegree : 5,
        interpolationAlgorithm : Cesium.LagrangePolynomialApproximation
    });
}

var globeFocus = function(lat, long, distance) {
  viewer.camera.flyTo({
    destination : Cesium.Cartesian3.fromDegrees(long, lat, distance)
  });
}

globeFocus(trips[trips.length-1].location[0],trips[trips.length-1].location[1], 10000000.0);
