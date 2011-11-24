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
    });
  };

  return api;
}();
