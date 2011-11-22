var map = function () {
  var api = {};
  
  api.show = function (latitude, longitude, slider) {
    var mapContainer = page.mapContainerHtml();
    var mapCanvas = page.mapCanvasHtml();
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

      var map = new google.maps.Map(page.mapCanvasDocumentElement(), myOptions);
    });
  };

  return api;
}();

