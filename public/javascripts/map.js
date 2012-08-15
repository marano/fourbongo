var map = function () {
  var api = {};
  
  api.show = function (latitude, longitude, slider) {
    var mapContainer = wallPage.mapContainerHtml();
    var mapCanvas = wallPage.mapCanvasHtml();
    mapCanvas.appendTo(mapContainer);
    
    slider.slide(mapContainer, function () {
      var myOptions = {
        zoom: 21,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        center: new google.maps.LatLng(latitude, longitude),
        mapTypeControl: false,
        overviewMapControl: false,
        panControl: false,
        zoomControl: false,
        streetViewControl: false
      };

      var map = new google.maps.Map(wallPage.mapCanvasDocumentElement(), myOptions);
      var zooms = [];
      for (var i = 20; i >= 2; i--) {
        zooms.push(i);
      }
      var delay = 1000;
      $(zooms).each(function (index, zoom) {
        setTimeout(function () { map.setZoom(zoom); }, delay);
        delay += 600;
      });
    });
  };

  api.distance = function (lat1, long1, lat2, long2) {
    var R = 6371; // Radius of the earth in km
    var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
    var dLon = (long2-long1).toRad(); 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d * 1000;
  };

  return api;
}();
